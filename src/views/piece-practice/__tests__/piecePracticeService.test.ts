import {
  piecePracticeMachine,
  initPiecePracticeContext,
} from "../piecePracticeService";
import { musicBank } from "@/lib/music-recognition";
import { listenObservables } from "@/views/listen/listenObservables";

function testMachine(optionsIn?: typeof piecePracticeMachine.options.services) {
  const options = {
    ...optionsIn,
  };

  const service = piecePracticeMachine
    .withConfig({
      services: options,
    })
    .withContext(initPiecePracticeContext(musicBank()[0], listenObservables()));

  return service;
}

it("begins at the initial play through", () => {
  const machine = testMachine();

  expect(machine.initialState.value).toBe("initialPlaythrough");

  expect(machine.context).toBe({});
});

// it("initially has no completed practice sections", () => {
//   const machine = testMachine();

//   expect(
//     machine.context!.piece.length
//   ).toBe(0);
// });

// describe('when initial play through is finished', () => {

// });

// it("is at initial play through when created", () => {
//   const machine = testMachine();

//   expect(machine.transition(machine.initialState, "PIECE_FINISHED").value).toBe(
//     "setupAudio"
//   );
// });

// it("enters setup synthesizer when using synthesizer", () => {
//   const machine = testMachine();

//   expect(machine.transition(machine.initialState, "USE_SYNTH").value).toBe(
//     "setupSynthesizer"
//   );
// });
