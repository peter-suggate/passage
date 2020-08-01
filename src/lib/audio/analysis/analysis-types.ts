import { Note } from "@/lib/scales";

export type AnalyzedNote = {
  clarity: number;
  value: Note;
  octave: number;
  age: number;
  t: number;
  cents: number;
};
