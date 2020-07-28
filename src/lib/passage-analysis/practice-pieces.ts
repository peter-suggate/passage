import { Piece } from "@/lib/music-recognition";
import { PracticeStats } from "./practice-stats";

export type PracticeSection = {
  stats: PracticeStats;
};
export type PracticeSections = PracticeSection[];

export type PracticePiece = {
  piece: Piece;
  sections: PracticeSections;
};

export type PracticePieces = PracticePiece[];

export const initPracticePieces = (): PracticePieces => [];

export const initPracticePiece = (piece: Piece): PracticePiece => ({
  piece,
  sections: [],
});
