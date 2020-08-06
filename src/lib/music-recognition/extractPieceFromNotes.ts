import { NoteDelta } from "./noteDeltas";
import { MatchedPiece, phraseMatchWithAlignment } from "./phraseMatch";

/**
 * Finds the start and end of a given sequence of notes that best matches the specified
 * piece.
 *
 * @param notes The sequence of note deltas. May contain extra / missing notes
 * @param piece The piece to match to.
 *
 * @returns a subset of @param notes that best matches the piece.
 */
export const extractPieceFromNotes = (
  notes: NoteDelta[],
  piece: MatchedPiece
) => {
  return {
    indexOfFirstNote: phraseMatchWithAlignment(notes, piece.piece.notes)
      .startIndex,
    notes,
  };
};

export type ExtractedPiece = ReturnType<typeof extractPieceFromNotes>;
