import { audioRecorderStatus } from "../AudioRecorder";
import { none, some } from "fp-ts/lib/Option";
import { emptyImpl } from "../../../testing/partial-impl";
import { Observable } from "rxjs";
import { AudioRecorderEventTypes } from "../recorder-types";

describe("getting state of current audio recorder", () => {
  it("returns 'uninitialized' when audio recorder is empty", () => {
    expect(audioRecorderStatus(none)).toBe("uninitialized");
  });

  it("returns current state of audio recorder when there is one", () => {
    expect(
      audioRecorderStatus(
        some({
          type: "starting",
          message: "Connecting to media",
        })
      )
    ).toBe("starting");

    expect(
      audioRecorderStatus(
        some({
          type: "stopping",
        })
      )
    ).toBe("stopping");

    expect(
      audioRecorderStatus(
        some({
          context: emptyImpl<AudioContext>(),
          analyzer$: emptyImpl<Observable<AudioRecorderEventTypes>>(),
          type: "running",
        })
      )
    ).toBe("running");

    expect(
      audioRecorderStatus(
        some({
          context: emptyImpl<AudioContext>(),
          analyzer$: emptyImpl<Observable<AudioRecorderEventTypes>>(),
          type: "stopped",
        })
      )
    ).toBe("stopped");
  });
});
