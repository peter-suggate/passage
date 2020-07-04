import { setupSynthesizerMachine } from "../setupSynthesizerMachine";
import { AudioSynthNode } from "../../recorder/synthaudio/AudioSynthNode";

function testMachine(optionsIn?: {}) {
  return setupSynthesizerMachine.withConfig({
    services: {
      createSynthAudio: (context, event) => AudioSynthNode.create(),
    },
  });
}

it("remembers configuration sent to it", () => {
  const machine = testMachine();

  expect(
    machine.transition(machine.initialState, {
      type: "UPDATE_CONFIG",
      config: { instrument: "violin" },
    }).context
  ).toEqual({});
});
