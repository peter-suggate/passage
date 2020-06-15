import { requireLeft, requireRight } from "../../../../testing/fp-testing";
import { createAudioRecorderTask } from "../audioRecorderSetup";

it("returns error if microphone is not available", async () => {
  const recorder = await createAudioRecorderTask({
    getAudioMediaStream: async () => {
      throw Error("No mic available");
    },
  })();

  expect(requireLeft(recorder)).toEqual(Error("No mic available"));
});

it("if all setup works, creates recorder in suspended state", async () => {
  const recorder = await createAudioRecorderTask({})();

  expect(requireRight(recorder).type).toBe("stopped");
});
