import { Opaque } from "../fp-util/opaque";

export type Bpm = Opaque<"Bpm", number>;

export const bpm = (value: number): Bpm => {
  if (value <= 0)
    throw Error("Valid BPMs must be greater than 0, got: " + value);

  return value as Bpm;
};

export type PosInteger = Opaque<"PosInteger", number>;

export const posInteger = (value: number): PosInteger => {
  if (value <= 0) {
    throw Error("Valid PosIntegers must be greater than 0, got: " + value);
  }

  return (value | 0) as PosInteger;
};

export type Integer = Opaque<"Integer", number>;

export const integer = (value: number): Integer => {
  return (value | 0) as Integer;
};

export type NonNegInteger = Opaque<"NonNegInteger", number>;

export const nonNegInteger = (value: number): NonNegInteger => {
  if (value < 0) {
    throw Error("Valid NonNegIntegers must be >= 0, got: " + value);
  }

  return (value | 0) as NonNegInteger;
};

export type PosNumber = Opaque<"PosNumber", number>;

export const posNumber = (value: number): PosNumber => {
  if (value <= 0)
    throw Error("Positive numbers must be greater than 0, got: " + value);

  return value as PosNumber;
};

export type ScaleHalftone = Opaque<"ScaleTone", number>;

export const scaleHalftone = (
  value: number,
  octaves: PosInteger = posInteger(1)
): ScaleHalftone => {
  if (value < 0 || value > (octaves - 1) * 12 + 11) {
    throw Error(
      "ScaleHalftones must be number between 0 and 11 inclusive, got: " + value
    );
  }

  return value as ScaleHalftone;
};

export type ScaleMode = "major" | "harmonic minor" | "melodic minor";

export type Note =
  | "A"
  | "A#"
  | "B"
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#";

export const note = (note: string) => {
  return note as Note;
};

export type OctaveNote = { value: Note; octave: Integer };

// export type ScaleHalftones = [Note, Note, Note, Note, Note, Note, Note];

// export const SCALES: Record<"A", Note[]> = {
//   A: ["A", "B", "C#", "D", "E", "F#", "G"],
//   // "A#": ["A", "B", "C#", "D", "E", "F#", "G"],
//   // B: ["A", "B", "C#", "D", "E", "F#", "G"],
//   // C: ["A", "B", "C#", "D", "E", "F#", "G"],
//   // "C#": ["A", "B", "C#", "D", "E", "F#", "G"],
//   // D: ["A", "B", "C#", "D", "E", "F#", "G"],
//   // "D#": ["A", "B", "C#", "D", "E", "F#", "G"],
//   // E: ["A", "B", "C#", "D", "E", "F#", "G"],
//   // F: ["A", "B", "C#", "D", "E", "F#", "G"],
//   // "F#": ["A", "B", "C#", "D", "E", "F#", "G"],
//   // G: ["A", "B", "C#", "D", "E", "F#", "G"],
//   // "G#": ["A", "B", "C#", "D", "E", "F#", "G"],
// };

export const NOTES: Note[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export type ScaleHalftones = [
  ScaleHalftone,
  ScaleHalftone,
  ScaleHalftone,
  ScaleHalftone,
  ScaleHalftone,
  ScaleHalftone,
  ScaleHalftone
];

export type Scale = { tonic: Note; mode: ScaleMode };
export type OctavesScale = {
  scale: Scale;
  startOctave: NonNegInteger;
  octaves: PosInteger;
};
