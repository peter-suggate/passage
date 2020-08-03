import { initRecordingSession, initRecordedPiece } from "../passage-operations";
import { TWINKLE, lookupPiece } from "@/lib/music-recognition";
import { PhraseBuilder } from "@/lib/music-recognition/PhraseBuilder";
import { makeNote } from "@/lib/audio/analysis";

describe("starting a new recording session", () => {});

describe("creating a new recorded piece", () => {
  it("for piece that perfectly matches played notes, stores passed-in notes as the piece's notes (ideal case)", () => {
    const twinkle = lookupPiece("Twinkle");

    const piece = initRecordedPiece(
      initRecordingSession(),
      { distance: 0, piece: twinkle },
      TWINKLE.noteNames.map((note) => makeNote(note))
    );

    expect(piece.notes).toEqual(
      TWINKLE.noteNames.map((note) => makeNote(note))
    );
  });

  // it("has no trouble spots", () => {
  //   const twinkle = lookupPiece("Twinkle");

  //   const piece = initRecordedPiece(
  //     initRecordingSession(),
  //     { distance: 0, piece: twinkle },
  //     TWINKLE.noteNames.map((note) => makeNote(note))
  //   );

  //   expect(piece.notes).toEqual(
  //     TWINKLE.noteNames.map((note) => makeNote(note))
  //   );
  // });

  // test('when passed-in notes include extra notes not from the piece, stores only notes starting from the beginning of the piece', () => {
  //   const twinkle = PhraseBuilder().push('B').push(TWINKLE.)
  // });

  // it('determines start time from the ')
  // it('initially ', () => {
  //   const session = initRecordingSession();

  // });
});
