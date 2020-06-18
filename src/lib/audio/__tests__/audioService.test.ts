import { makeAudioService, audioMachine } from "../audioService";

it("", () => {
  const machine = audioMachine.withConfig({
    services: {
      audioSetup: (context, event) => async () => ({
        context: new AudioContext(),
      }),
      resume: (context) => resumeAudio(context.context!),
      suspend: (context) => suspendAudio(context.context!),
      analyzer: (context) => activeNoteMachine,
    },
  });

  const { initialState } = machine;

  expect(machine.transition(initialState, "START").value).toBe("inSetup");
});
