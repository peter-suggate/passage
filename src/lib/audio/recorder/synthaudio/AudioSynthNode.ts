import { Subject } from "rxjs";
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

function isTest() {
  return process.env.JEST_WORKER_ID !== undefined;
}

export class AudioSynthNode extends Subject<AudioRecorderEventTypes>
  implements Suspendable {
  private constructor(
    private readonly config: SynthesizerConfig,
    private readonly wasmSamplesProcessor: AudioSamplesProcessor,
    private readonly pitchDetector: PitchDetector
  ) {
    super();

    this.next({
      type: "onset",
      t: 0,
    });

    // this.next({
    //   type: "pitch",
    //   pitch,
    // });
  }

  async suspend() {
    // await this.context.suspend();
  }

  async resume() {
    // await this.context.resume();
    console.log("audioSynthNode resume called");
  }

  static async create(config: SynthesizerConfig) {
    try {
      const wasmBytes = await AudioSynthNode.fetchMusicAnalyzerWasm();

      await init(WebAssembly.compile(wasmBytes));

      const wasmSamplesProcessor = AudioSamplesProcessor.new();

      const pitchDetector = wasmSamplesProcessor.create_pitch_detector(
        "McLeod",
        2048
      );

      if (!pitchDetector) {
        throw Error("Wasm pitch detector could not be created");
      }

      return new AudioSynthNode(config, wasmSamplesProcessor, pitchDetector);
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
      AudioSynthNode.scriptUrl(
        "music-analyzer-wasm-rs/music_analyzer_wasm_rs_bg.wasm"
      )
    );

    return res.arrayBuffer();
  }
}
