import { ListenObservables } from "../listen/listenObservables";

export const piecePracticeObservables = (
  listenObservables: ListenObservables
) => {
  const {
    note$,
    closestMatchingPieces$,
    matchedPiece$,
    recentDistinctNotes$,
  } = listenObservables;

  return {
    note$,
    recentDistinctNotes$,
    closestMatchingPieces$,
    matchedPiece$,
  };
};

export type PiecePracticeObservables = ReturnType<
  typeof piecePracticeObservables
>;
