import { Subject } from "rxjs";
import { TaskEither, right } from "fp-ts/lib/TaskEither";
import {
  AudioRecorderEventTypes,
  AudioProcessorEventTypes,
  AudioContextMin,
} from "../recorder-types";

function scriptUrl(scriptPath: string) {
  const publicUrl = "http://localhost:8080/public";

  return `${publicUrl}/${scriptPath}`;
}

export class FakeAudioSubject extends Subject<AudioRecorderEventTypes>
  implements AudioContextMin {
  private constructor() {
    super();
  }

  state: "closed" | "running" | "suspended" = "closed";
  async suspend() {
    this.state = "suspended";
  }
  async resume() {
    this.state = "running";
  }

  static create(): TaskEither<Error, FakeAudioSubject> {
    return right(new FakeAudioSubject());
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
