import { AnalyzedNote } from "../audio/analysis";
import { RelativeTimePos, TimePos } from "@/lib/scales";
import { Piece } from "../music-recognition";

export type RecordedSession = {
  start: TimePos;

  pieces: RecordedPiece[];
};

export type RecordedPiece = {
  // Start time relative to the session.
  start: RelativeTimePos;

  notes: AnalyzedNote[];

  piece: Piece;

  troubleSpots: RecordedPassage[];
};

export type RecordedPassage = {
  // Start time relative to the piece.
  start: RelativeTimePos;
};
