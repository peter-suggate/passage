import { Subject, of, Subscription } from "rxjs";
import {
  AudioRecorderEventTypes,
  AudioProcessorEventTypes,
  Suspendable,
} from "../recorder-types";
import { noteToFrequency } from "@/lib/audio/analysis";
import init, {
  AudioSamplesProcessor,
  PitchDetector,
} from "../../../../../public/music-analyzer-wasm-rs/music_analyzer_wasm_rs";
import { SynthesizerConfig } from "../../synth/synth-types";
import { animationFrame } from "rxjs/internal/scheduler/animationFrame";
import { repeat, map } from "rxjs/operators";
import {
  generateScaleHalftones,
  halftonesFromConcertA,
} from "@/lib/scales/generateScaleHalftones";
import { OctavesScale, Bpm, ScaleHalftone } from "@/lib/scales";

function isTest() {
  return process.env.JEST_WORKER_ID !== undefined;
}

const bpmToMsPerBeat = (bpm: Bpm) => {
  return (1000 * bpm) / 60;
};

export const pitchAtMs = (
  ms: number,
  config: Pick<SynthesizerConfig, "bpm" | "scaleType">,
  memo: Map<OctavesScale, ScaleHalftone[]>
): number => {
  const { bpm, scaleType } = config;

  const fullScale = generateScaleHalftones(scaleType, memo);

  const scaleNoteIndex =
    Math.floor(ms / bpmToMsPerBeat(bpm)) % fullScale.length;

  // const frameInScale = frame % fullScale.length;
  // const numberOfNotesInScale = 2 * scale.length * octaves - 1;

  // // const octave =
  // const semitonesAboveTonic =
  //   Math.floor(frame / bpmToMsPerBeat(bpm)) % numberOfNotesInScale;

  return noteToFrequency(
    fullScale[scaleNoteIndex] +
      halftonesFromConcertA(scaleType.scale.tonic, scaleType.startOctave)
  );
};

export class AudioSynthesizer extends Subject<AudioRecorderEventTypes>
  implements Suspendable {
  private memo = new Map();

  private constructor(
    private readonly config: SynthesizerConfig,
    private readonly wasmSamplesProcessor: AudioSamplesProcessor,
    private readonly pitchDetector: PitchDetector
  ) {
    super();
  }

  async suspend() {
    this.samplesGeneratorSubscription &&
      this.samplesGeneratorSubscription.unsubscribe();
  }

  samplesGeneratorSubscription: Subscription | undefined = undefined;

  async resume() {
    // Synthesize samples that get sent to the wasm processor.
    this.samplesGeneratorSubscription = of(animationFrame.now(), animationFrame)
      .pipe(
        repeat(),
        map((start) => animationFrame.now() - start),
        map((t) => ({ t, noteFreq: pitchAtMs(t, this.config, this.memo) }))
      )
      .subscribe((frame) => this.tick(frame));
  }

  prevNoteFreq = 0;

  tick(frame: { t: number; noteFreq: number }) {
    const SAMPLE_RATE = 48000;
    const CHUNK_SIZE = 128;
    const UPDATES_PER_SECOND = SAMPLE_RATE / CHUNK_SIZE;
    // this.wasmSamplesProcessor.add_samples_chunk();

    if (frame.noteFreq !== this.prevNoteFreq) {
      this.next({
        type: "onset",
        t: frame.t,
      });
    }

    this.next({
      type: "pitch",
      pitch: {
        clarity: 0.9,
        frequency: frame.noteFreq,
        onset: false,
        t: frame.t,
      },
    });
  }

  static async create(config: SynthesizerConfig) {
    try {
      const wasmBytes = await AudioSynthesizer.fetchMusicAnalyzerWasm();

      await init(WebAssembly.compile(wasmBytes));

      const wasmSamplesProcessor = AudioSamplesProcessor.new();

      const pitchDetector = wasmSamplesProcessor.create_pitch_detector(
        "McLeod",
        2048
      );

      if (!pitchDetector) {
        throw Error("Wasm pitch detector could not be created");
      }

      return new AudioSynthesizer(config, wasmSamplesProcessor, pitchDetector);
    } catch (e) {
      console.warn(e);
      throw new Error(
        `Failed to load audio analyzer WASM module. Further info: ${e.message}`
      );
    }
  }

  private static scriptUrl(scriptPath: string) {
    const publicUrl = isTest() ? "./public" : window.location.href;

    return `${publicUrl}/${scriptPath}`;
  }

  private static async fetchMusicAnalyzerWasm() {
    const res = await globalThis.fetch(
      AudioSynthesizer.scriptUrl(
        "music-analyzer-wasm-rs/music_analyzer_wasm_rs_bg.wasm"
      )
    );

    return res.arrayBuffer();
  }
}
