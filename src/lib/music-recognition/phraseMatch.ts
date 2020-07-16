import { NoteDelta } from "./noteDeltas";
import { MusicBank } from "./musicBank";
import { NonNegInteger, nonNegInteger } from "../scales";
const { editDistanceForClosestMatch } = require("edit-distance-search");

export const phraseMatch = (
  phrase: NoteDelta[],
  piece: NoteDelta[]
): NonNegInteger => {
  return editDistanceForClosestMatch(piece.join(" "), phrase.join(" "));
};

export const pieceMatch = (phrase: NoteDelta[], bank: MusicBank) => {
  const closest = bank.reduce(
    (memo, cur) => {
      const distance = phraseMatch(phrase, cur.notes);

      if (distance < memo.distance) {
        return { distance: nonNegInteger(distance), name: cur.name };
      }

      return memo;
    },
    { distance: nonNegInteger(phrase.length), name: "" }
  );

  return closest.name;
};
