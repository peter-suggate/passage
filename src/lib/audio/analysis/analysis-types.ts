import { Note } from "@/lib/scales";
import { Piece } from "@/lib/music-recognition";

export type AnalyzedNote = {
  clarity: number;
  value: Note;
  octave: number;
  age: number;
  t: number;
  cents: number;
};

export const makeNote = (
  value: Note = "A",
  t = 0,
  cents = 0,
  clarity = 0.9,
  octave = 4
): AnalyzedNote => ({
  age: t,
  cents,
  clarity,
  octave,
  t,
  value,
});

export const makeNotes = (noteNames: Note[]): AnalyzedNote[] =>
  noteNames.map((n, index) => makeNote(n, index));
