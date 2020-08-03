import { NoteDelta } from "./noteDeltas";
import { MusicBank, Piece } from "./musicBank";
import { NonNegInteger, nonNegInteger } from "../scales";
/* eslint-disable @typescript-eslint/no-var-requires */
const { editDistanceForClosestMatch } = require("edit-distance-search");

export const phraseMatch = (
  phrase: NoteDelta[],
  piece: NoteDelta[]
): NonNegInteger => {
  return editDistanceForClosestMatch(piece.join(" "), phrase.join(" "));
};

export const pieceMatch = (phrase: NoteDelta[], bank: MusicBank) => {
  const closest = bank.reduce<{ distance: number; piece?: Piece }>(
    (memo, cur) => {
      const distance = phraseMatch(phrase, cur.notes);

      if (distance < memo.distance) {
        return { distance: nonNegInteger(distance), piece: cur };
      }

      return memo;
    },
    { distance: nonNegInteger(phrase.length), piece: undefined }
  );

  // Assume the music bank always has at least one piece in it so we can always
  // find a match.
  return closest as { distance: number; piece: Piece };
};

export type MatchedPiece = ReturnType<typeof pieceMatch>;

export const closestMatches = (phrase: NoteDelta[], bank: MusicBank) => {
  return bank
    .map((piece) => {
      const distance = phraseMatch(phrase, piece.notes);

      return {
        distance,
        piece,
      };
    })
    .sort((a, b) => a.distance - b.distance);
};

export type ClosestMatches = ReturnType<typeof closestMatches>;
