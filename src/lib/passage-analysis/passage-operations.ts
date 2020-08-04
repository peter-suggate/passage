import {
  MatchedPiece,
  lookupPiece,
  phraseMatchWithAlignment,
} from "@/lib/music-recognition";
import { RecordedSession, RecordedPiece } from "./passage-types";
import { AnalyzedNote } from "../audio/analysis";
import { extractPieceFromNotes } from "../music-recognition/extractPieceFromNotes";
import { noteDeltasFromNames } from "../music-recognition/noteDeltas";
import { relativeTimePos } from "../scales";

export const initRecordingSession = (
  start: Date = new Date(Date.now())
): RecordedSession => ({
  start,
  pieces: [],
});

export const addPieceToSession = (
  session: RecordedSession,
  match: MatchedPiece,
  notes: AnalyzedNote[]
): RecordedSession => ({
  ...session,

  pieces: [...session.pieces, initRecordedPiece(session.start, match, notes)],
});

/**
 * Initialize a piece being played within a recording session.
 *
 * @param session The current recording session
 * @param piece Piece of music being played
 * @param recentDistinctNotes Notes that led up to identification of this piece. Note: this array likely
 * includes notes also not in the piece.
 */
export const initRecordedPiece = (
  sessionStart: Date,
  match: MatchedPiece,
  recentDistinctNotes: AnalyzedNote[]
): RecordedPiece => {
  phraseMatchWithAlignment(
    noteDeltasFromNames(recentDistinctNotes.map((n) => n.value)),
    match.piece.notes
  );

  const { indexOfFirstNote /*, notes*/ } = extractPieceFromNotes(
    noteDeltasFromNames(recentDistinctNotes.map((n) => n.value)),
    match
  );

  const firstNote = recentDistinctNotes[indexOfFirstNote];

  return {
    start: relativeTimePos(sessionStart, firstNote.t),
    piece: lookupPiece(match.piece.name),
    notes: recentDistinctNotes.slice(indexOfFirstNote),
    troubleSpots: [],
  };
};
