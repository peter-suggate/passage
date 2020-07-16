import { NonNegInteger, ScaleHalftone, Integer, integer } from "@/lib/scales";

// type ScaleHalftoneAndOctave = { degree: ScaleHalftone; octave: NonNegInteger };

export type NoteDelta = Integer;

// function absoluteDegree(note: ScaleHalftoneAndOctave): Integer {
//   return integer(note.octave * 12 + note.degree);
// }

// function scaleHalftoneToDelta(
//   note: ScaleHalftoneAndOctave,
//   prev: ScaleHalftoneAndOctave | undefined
// ): NoteDelta {
//   if (prev === undefined) {
//     return integer(0);
//   }

//   return integer(absoluteDegree(note) - absoluteDegree(prev));
// }

// export const noteDeltas = (notes: ScaleHalftoneAndOctave[]) => {
//   return notes.map((ht, index) => scaleHalftoneToDelta(ht, notes[index - 1]));
// };

const noteDelta = (noteValue: Integer, prev?: Integer) => {
  if (prev === undefined) {
    return integer(0);
  }

  return integer(noteValue - prev);
};

export const noteDeltas = (noteValues: Integer[]) => {
  return noteValues.map((val, index) => noteDelta(val, noteValues[index - 1]));
};
