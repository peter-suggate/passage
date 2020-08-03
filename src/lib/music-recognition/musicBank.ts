import { NoteDelta } from "./noteDeltas";
import { Note, integer, NOTES, posInteger } from "@/lib/scales";
import { PhraseBuilder } from "./PhraseBuilder";

export type Piece = { name: string; notes: NoteDelta[] };

export type MusicBank = Piece[];

export const TWINKLE = PhraseBuilder()
  .push("D", "A", "B", "A", "G", "F#", "E", "D")
  .push("A", "G", "F#", "E", "A", "G", "F#", "E")
  .push("D", "A", "B", "A", "G", "F#", "E", "D");

export const FRENCH_FOLK_SONG = PhraseBuilder()
  .push("D", "C#")
  .down()
  .push("B")
  .up()
  .push("C#", "D")
  .down()
  .push("A")
  .push("G", "F#", "E", "D")
  .repeat(posInteger(3), "D", "E", "F#")
  .push("G")
  .repeat(posInteger(3), "E", "F#", "G")
  .push("A")
  .up()
  .push("D", "C#")
  .down()
  .push("B", "A", "G", "F#", "E", "D", "E", "D");

export const MAJOR_SCALE = PhraseBuilder()
  .push("C", "D", "E", "F", "G", "A", "B")
  .up()
  .push("C")
  .down()
  .push("B", "A", "G", "F", "E", "D", "C");

export const HARMONIC_MINOR_SCALE = PhraseBuilder()
  .push("C", "D", "D#", "F", "G", "G#", "B")
  .up()
  .push("C")
  .down()
  .push("B", "G#", "G", "F", "D#", "D", "C");

export const MELODIC_MINOR_SCALE = PhraseBuilder()
  .push("C", "D", "D#", "F", "G", "A", "B")
  .up()
  .push("C")
  .down()
  .push("A#", "G#", "G", "F", "D#", "D", "C");

export const piece = (name: string, builder = TWINKLE): Piece => ({
  name,
  notes: builder.noteDeltas,
});

export const musicBank = (): MusicBank =>
  [
    { name: "Twinkle", builder: TWINKLE },
    { name: "French Folk Song", builder: FRENCH_FOLK_SONG },
    { name: "Major Scale", builder: MAJOR_SCALE },
    { name: "Harmonic Minor Scale", builder: HARMONIC_MINOR_SCALE },
    { name: "Melodic Minor Scale", builder: MELODIC_MINOR_SCALE },
  ].map(({ name, builder }) => ({ name, notes: builder.noteDeltas }));

export const lookupPiece = (name: string): Piece => {
  const match = musicBank().find((piece) => piece.name === name);

  if (!match) throw Error(`No piece of name: ${name} in music bank.`);

  return match;
};
