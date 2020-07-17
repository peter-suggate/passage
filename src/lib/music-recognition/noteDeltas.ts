import { Integer, integer } from "@/lib/scales";

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
