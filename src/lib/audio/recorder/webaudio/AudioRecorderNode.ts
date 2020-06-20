import { Subject } from "rxjs";
import {
  AudioRecorderEventTypes,
  AudioProcessorEventTypes,
} from "../recorder-types";

function scriptUrl(scriptPath: string) {
  const publicUrl = "http://localhost:8080";

  return `${publicUrl}/${scriptPath}`;
}

export class AudioRecorderNode extends Subject<AudioRecorderEventTypes> {
  audioWorkletNode: AudioWorkletNode;

  private constructor(context: AudioContext, wasmBytes: ArrayBuffer) {
    super();

    this.audioWorkletNode = new globalThis.AudioWorkletNode(
      context,
      "audio-processor"
    );

    this.audioWorkletNode.port.onmessage = (event) =>
      this.onmessage(event.data);

    this.audioWorkletNode.port.postMessage({
      type: "load-wasm-module",
      wasmBytes,
    });

    this.audioWorkletNode.onprocessorerror = (e) => {
      console.log(
        `An error from AudioWorkletProcessor.process() occurred: ${e}`
      );
    };
  }

  static async create(context: AudioContext) {
    await context.suspend();

    // Add our audio processor worklet to the context.
    try {
      await context.audioWorklet.addModule(AudioRecorderNode.processorUrl);
    } catch (e) {
      throw new Error(
        `Failed to load audio analyzer worklet at url: ${AudioRecorderNode.processorUrl}. Further info: ${e.message}`
      );
    }

    try {
      const wasmBytes = await AudioRecorderNode.fetchMusicAnalyzerWasm();

      return new AudioRecorderNode(context, wasmBytes);
    } catch (e) {
      throw new Error(
        `Failed to load audio analyzer WASM module. Further info: ${e.message}`
      );
    }
  }

  static get processorUrl(): string {
    return scriptUrl("audio-processor.js");
  }

  private static async fetchMusicAnalyzerWasm() {
    const res = await globalThis.fetch(
      scriptUrl("music-analyzer-wasm-rs/music_analyzer_wasm_rs_bg.wasm")
    );
    return res.arrayBuffer();
  }

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
