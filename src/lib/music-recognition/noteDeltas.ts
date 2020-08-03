import { Integer, integer, Note } from "@/lib/scales";
import { PhraseBuilder } from "./PhraseBuilder";

export type NoteDelta = Integer;

const noteDelta = (noteValue: Integer, prev?: Integer) => {
  if (prev === undefined) {
    return integer(0);
  }

  return integer(noteValue - prev);
};

export const noteDeltas = (noteValues: Integer[]) => {
  return noteValues.map((val, index) => noteDelta(val, noteValues[index - 1]));
};

export const noteDeltasFromNames = (noteNames: Note[]) =>
  PhraseBuilder().push(...noteNames).noteDeltas;
