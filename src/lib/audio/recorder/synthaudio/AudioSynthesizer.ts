import { Subject, of, Subscription } from "rxjs";
import {
  AudioRecorderEventTypes,
  AudioProcessorEventTypes,
  Suspendable,
} from "../recorder-types";
import init, {
  AudioSamplesProcessor,
  PitchDetector,
} from "../../../../../public/music-analyzer-wasm-rs/music_analyzer_wasm_rs";
import { SynthesizerConfig } from "../../synth/synth-types";
import { animationFrame } from "rxjs/internal/scheduler/animationFrame";
import { repeat, map } from "rxjs/operators";

function isTest() {
  return process.env.JEST_WORKER_ID !== undefined;
}

export class AudioSynthesizer extends Subject<AudioRecorderEventTypes>
  implements Suspendable {
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
        map((start) => animationFrame.now() - start)
      )
      .subscribe((frame) => this.tick(frame));
  }

  tick(frame: number) {
    // this.wasmSamplesProcessor.add_samples_chunk();

    if (Math.round(frame / 1000) % 5 === 0) {
      this.next({
        type: "onset",
        t: frame,
      });
    }

    this.next({
      type: "pitch",
      pitch: {
        clarity: 0.9,
        frequency: 440,
        onset: false,
        t: frame,
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
