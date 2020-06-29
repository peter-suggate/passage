import { makeAudioService, audioMachine } from "../audioService";
import { interpret } from "xstate";
import TestAudioContext from "../test-fixtures/AudioContext";

function testMachine(optionsIn?: {
  // audioSetup: (context, event) => audioSetupMachine,
  // resume: (context) => resumeAudio(context.context!),
  // suspend: (context) => suspendAudio(context.context!),
  // analyzer: (context) => activeNoteMachine,
}) {
  // const options = {
  //   ...optionsIn,
  //   audioSetup
  // };

  return audioMachine.withConfig({
    services: {
      audioSetup: (context, event) => async () => ({
        audio: new TestAudioContext(),
      }),
      resume: (context) => async () => {},
      suspend: (context) => async () => {},
      analyzer: (context) => async () => {},
    },
  });
}

it("enters setup when started", () => {
  const machine = testMachine();

  expect(machine.transition(machine.initialState, "START").value).toBe(
    "setupStart"
  );
});

// it("should go to resuming state when audio setup succeeds", async (done) => {
//   const audio = new TestAudioContext();
//   const audioSetup = async () => audio;

//   const machine = testMachine({
//     audioSetup,
//   });

//   interpret(machine)
//     .onTransition((state) => {
//       if (state.matches("resuming")) {
//         expect(state.context.audio).toEqual(audio);

//         done();
//       }
//     })
//     .start()
//     .send("START");
// });
