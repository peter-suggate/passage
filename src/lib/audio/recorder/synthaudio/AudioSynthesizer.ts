import { Subject, of, Subscription } from "rxjs";
import { AudioRecorderEventTypes } from "../recorder-types";
import init, {
  AudioSamplesProcessor,
  PitchDetector,
} from "../../../../../public/music-analyzer-wasm-rs/music_analyzer_wasm_rs";
import { SynthesizerConfig } from "../../synth/synth-types";
import { animationFrame } from "rxjs/internal/scheduler/animationFrame";
import { repeat, map } from "rxjs/operators";
import { Pitch } from "music-analyzer-wasm-rs";
import { makePitchProducerService } from "./pitchProducerService";
import { nonNegInteger } from "@/lib/scales";
import { PitchProducerConfig } from "./PitchProducer";

function isTest() {
  return process.env.JEST_WORKER_ID !== undefined;
}

const SinewaveGenerator = (sampleRate: number) => {
  let x = 0;

  const TWO_PI = Math.PI * 2;
  const invSampleRate = 1 / sampleRate;

  return {
    next: (atFreq: number) => {
      x += TWO_PI * atFreq * invSampleRate;
      return Math.sin(x);
    },
  };
};

export interface PieceSynthesizer {
  /**
   * Stop whatever we're currently playing and start producing ntoes for the given piece.
   *
   * @param piece A description of the piece to switch to.
   */
  switchTo(config: PitchProducerConfig): void;
}

export class AudioSynthesizer extends Subject<AudioRecorderEventTypes>
  implements PieceSynthesizer {
  private memo = new Map();

  static SAMPLE_RATE = 48000;
  static CHUNK_SIZE = 128;
  static UPDATES_PER_SECOND =
    AudioSynthesizer.SAMPLE_RATE / AudioSynthesizer.CHUNK_SIZE;

  prevNoteFreq = 0;
  prevNoteT = 0;
  wasmChunkBuffer = new Float32Array(AudioSynthesizer.CHUNK_SIZE);
  sinewaveGenerator = SinewaveGenerator(AudioSynthesizer.SAMPLE_RATE);

  private constructor(
    private readonly config: SynthesizerConfig,
    private readonly wasmSamplesProcessor: AudioSamplesProcessor,
    private readonly pitchDetector: PitchDetector,
    private readonly pitchProducer = makePitchProducerService()
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
        map((t) => this.produceFrame(t))
      )
      .subscribe((frame) => this.tick(frame));
  }

  private sendSamplesToWasm(frame: { t: number; noteFreq: number }) {
    const msElapsed = frame.t - this.prevNoteT;
    const chunks = Math.floor(
      (AudioSynthesizer.UPDATES_PER_SECOND * msElapsed) / 1000
    );
    for (let i = 0; i < chunks; i++) {
      for (let dx = 0; dx < AudioSynthesizer.CHUNK_SIZE; dx++)
        this.wasmChunkBuffer[dx] = this.sinewaveGenerator.next(frame.noteFreq);
      this.wasmSamplesProcessor.add_samples_chunk(this.wasmChunkBuffer);
    }
    this.prevNoteT = frame.t;
  }

  switchTo(
    config: Pick<PitchProducerConfig, "piece" | "startNote" | "bpm">
  ): void {
    this.pitchProducer.send({
      type: "START_PIECE",
      config: {
        ...config,
        startTime: nonNegInteger(this.prevNoteT),
      },
    });
  }

  produceFrame(t: number) {
    const { producer } = this.pitchProducer.state.context;
    if (!producer) {
      throw Error(
        "Retrieving values from the audio synthesizer without first having started a piece."
      );
      // return { t, noteFreq: 0 };
    }

    return {
      t,
      noteFreq: producer(
        nonNegInteger(t)
      ) /*pitchAtMs(t, this.config, this.memo)*/,
    };
  }

  tick(frame: { t: number; noteFreq: number }) {
    this.sendSamplesToWasm(frame);

    if (!this.wasmSamplesProcessor.has_sufficient_samples(this.pitchDetector)) {
      return;
    }

    this.wasmSamplesProcessor.set_latest_samples_on(this.pitchDetector);

    const result = this.pitchDetector.pitches();

    if (result.code !== "success") {
      console.log("error getting pitches", result.message);
    } else {
      const pitches = result.pitches;
      if (pitches.length > 0) {
        pitches.forEach((pitch: Pitch) => {
          if (pitch.onset) {
            this.next({
              type: "onset",
              t: pitch.t,
            });
          } else {
            this.next({
              type: "pitch",
              pitch: {
                clarity: pitch.clarity,
                frequency: pitch.frequency,
                onset: false,
                t: pitch.t,
              },
            });
          }
        });

        pitches.forEach((p) => p.free());
      }
    }
  }

  static async create(
    config: SynthesizerConfig,
    windowSamples = 2048,
    powerThreshold = 0.9,
    clarityThreshold = 0.75
  ) {
    try {
      const wasmBytes = await AudioSynthesizer.fetchMusicAnalyzerWasm();

      await init(WebAssembly.compile(wasmBytes));

      const wasmSamplesProcessor = AudioSamplesProcessor.new();

      const pitchDetector = wasmSamplesProcessor.create_pitch_detector(
        "McLeod",
        windowSamples,
        AudioSynthesizer.SAMPLE_RATE,
        powerThreshold,
        clarityThreshold
      );

      if (!pitchDetector) {
        throw Error("Wasm pitch detector could not be created");
      }

      const result = new AudioSynthesizer(
        config,
        wasmSamplesProcessor,
        pitchDetector
      );

      result.switchTo(config);

      return result;
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
