// const { editDistanceForClosestMatch } = require("edit-distance-search");
import { NoteDelta } from "./noteDeltas";
import { MatchedPiece } from "./phraseMatch";

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
  // TODO perform a trace back.
  // editDistanceForClosestMatch();

  return {
    indexOfFirstNote: 0,
    notes,
  };
};

export type ExtractedPiece = ReturnType<typeof extractPieceFromNotes>;
