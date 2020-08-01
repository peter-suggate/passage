import {
  piecePracticeMachine,
  initPiecePracticeContext,
} from "../piecePracticeService";
import { TWINKLE } from "@/lib/music-recognition";
import { listenObservables } from "@/views/listen/listenObservables";
import { AnalyzedNote } from "@/lib/audio/analysis";
import { Note, note } from "@/lib/scales";
import { of } from "rxjs";

const testNote = (note: Note): AnalyzedNote => ({
  age: 0,
  t: 9,
  cents: 0,
  clarity: 1.0,
  value: note,
  octave: 4,
});

function testMachine(optionsIn?: typeof piecePracticeMachine.options.services) {
  const options = {
    ...optionsIn,
  };

  const service = piecePracticeMachine
    .withConfig({
      services: options,
    })
    .withContext(
      initPiecePracticeContext(
        {
          name: "Twinkle",
          notes: TWINKLE.noteDeltas,
        },
        listenObservables(of(...TWINKLE.noteNames.map((n) => testNote(n))))
      )
    );

  return service;
}

it("begins at the section practice", () => {
  const machine = testMachine();

  expect(machine.initialState.value).toBe("sectionPractice");

  expect(machine.context!.piece.piece.name).toBe("Twinkle");

  expect(machine.context!.piece.sections.length).toBe(0);
});

// it("initially has no completed practice sections", () => {
//   const machine = testMachine();

//   expect(
//     machine.context!.piece.length
//   ).toBe(0);
// });

// describe('when initial play through is finished', () => {
//   it('transitions to waiting', () => {
//     const machine = testMachine();

//   });
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
