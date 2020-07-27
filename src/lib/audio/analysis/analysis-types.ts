import { Note } from "@/lib/scales";

export type NearestNote = {
  clarity: number;
  value: Note;
  octave: number;
  age: number;
  cents: number;
};
