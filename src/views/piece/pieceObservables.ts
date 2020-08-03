import { SessionObservables } from "../session/sessionObservables";

export const pieceObservables = (sessionObservables: SessionObservables) => {
  const {
    note$,
    closestMatchingPieces$,
    matchedPiece$,
    recentDistinctNotes$,
  } = sessionObservables;

  return {
    note$,
    recentDistinctNotes$,
    closestMatchingPieces$,
    matchedPiece$,
  };
};

export type PiecePracticeObservables = ReturnType<typeof pieceObservables>;
