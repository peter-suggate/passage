import { piecePracticeMachine, initPieceContext } from "../pieceService";
import { TWINKLE, lookupPiece } from "@/lib/music-recognition";
import { sessionObservables } from "@/views/session/sessionObservables";
import { makeNotes } from "@/lib/audio/analysis";
import { of } from "rxjs";
import {
  initRecordingSession,
  initRecordedPiece,
} from "@/lib/passage-analysis";

function testMachine(optionsIn?: typeof piecePracticeMachine.options.services) {
  const options = {
    ...optionsIn,
  };

  const notes = makeNotes(TWINKLE.noteNames);

  const service = piecePracticeMachine
    .withConfig({
      services: options,
    })
    .withContext(
      initPieceContext(
        initRecordedPiece(
          new Date(),
          {
            distance: 0,
            piece: lookupPiece("Twinkle"),
          },
          notes
        ),
        sessionObservables(of(...notes))
      )
    );

  return service;
}

it("begins at the section practice", () => {
  const machine = testMachine();

  expect(machine.initialState.value).toBe("sectionPractice");

  expect(machine.context!.piece.piece.name).toBe("Twinkle");

  // expect(machine.context!.piece.sections.length).toBe(0);
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
