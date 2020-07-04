import { Subject } from "rxjs";
import {
  AudioRecorderEventTypes,
  AudioProcessorEventTypes,
} from "../recorder-types";
import init, {
  AudioSamplesProcessor,
  PitchDetector,
} from "../../../../../public/music-analyzer-wasm-rs/music_analyzer_wasm_rs.js";
/* eslint-disable @typescript-eslint/no-var-requires */
// const asd = require("../../../../../public/worker-polyfills/text-encoder");
// const wasm = require("../../../../../public/music-analyzer-wasm-rs/music_analyzer_wasm_rs");
// var init, { AudioSamplesProcessor, PitchDetector } = require("../../../../../public/music-analyzer-wasm-rs/music_analyzer_wasm_rs");
// import init, {
//   PitchDetector,
//   AudioSamplesProcessor,
// } from "music-analyzer-wasm-rs/music_analyzer_wasm_rs";

export class AudioSynthNode extends Subject<AudioRecorderEventTypes> {
  private constructor(
    private wasmSamplesProcessor: any /*AudioSamplesProcessor*/,
    private pitchDetector: any /*PitchDetector*/
  ) {
    super();
  }

  private async loadWasm(wasmBytes: ArrayBuffer) {
    await init(WebAssembly.compile(wasmBytes));
  }

  static async create() {
    try {
      console.log("synthesizer: loading wasm");

      // const wasmBytes = await AudioSynthNode.fetchMusicAnalyzerWasm();
      // const wasm = await init(WebAssembly.compile(wasmBytes));

      const wasmSamplesProcessor = AudioSamplesProcessor.new();

      const pitchDetector = wasmSamplesProcessor.create_pitch_detector(
        "McLeod",
        2048
      );

      if (!pitchDetector) {
        throw Error("Wasm pitch detector could not be created");
      }

      return new AudioSynthNode(wasmSamplesProcessor, pitchDetector);
    } catch (e) {
      throw new Error(
        `Failed to load audio analyzer WASM module. Further info: ${e.message}`
      );
    }
  }

  // private static async fetchMusicAnalyzerWasm() {
  //   const res = await globalThis.fetch(
  //     scriptUrl("music-analyzer-wasm-rs/music_analyzer_wasm_rs_bg.wasm")
  //   );
  //   return res.arrayBuffer();
  // }

  onmessage(eventData: AudioProcessorEventTypes) {
    switch (eventData.type) {
      case "initialized": {
        break;
      }
      case "pitches": {
        eventData.result.forEach((pitch) => {
          if (pitch.is_onset) {
            this.next({
              type: "onset",
              t: pitch.t,
            });
          }

          this.next({
            type: "pitch",
            pitch,
          });
        });

        break;
      }
      default:
        break;
    }
  }
}
