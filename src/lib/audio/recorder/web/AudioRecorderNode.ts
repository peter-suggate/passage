import { Subject } from "rxjs";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { taskFromAsync } from "../../../fp-util";
import {
  AudioRecorderEventTypes,
  AudioProcessorEventTypes,
} from "../recorder-types";

function scriptUrl(scriptPath: string) {
  const publicUrl = "http://localhost:8080/public";

  return `${publicUrl}/${scriptPath}`;
}

export class AudioAnalyzerNode extends Subject<AudioRecorderEventTypes> {
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

  static create(context: AudioContext): TaskEither<Error, AudioAnalyzerNode> {
    // Fetch the Wasm module as raw bytes and pass to the worklet.
    return taskFromAsync(async () => {
      await context.suspend();

      // Add our audio processor worklet to the context.
      await context.audioWorklet.addModule(AudioAnalyzerNode.processorUrl);

      const wasmBytes = await AudioAnalyzerNode.fetchMusicAnalyzerWasm();

      return new AudioAnalyzerNode(context, wasmBytes);
    });
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

        // console.log(
        //   `latest pitches (Hz) amount: ${eventData.result.length}, first: `,
        //   eventData.result.map(
        //     (e) => `is_onset: ${e.is_onset}, frequency: ${e.frequency}`
        //   )
        // );
        break;
      }
      default:
        break;
    }
  }
}
