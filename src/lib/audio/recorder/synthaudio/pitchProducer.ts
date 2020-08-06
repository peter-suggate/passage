import { NonNegInteger, nonNegInteger, Bpm, bpm, Note } from "@/lib/scales";
import { Piece } from "@/lib/music-recognition";
import { noteToFrequency } from "../../analysis";
import { halftonesFromConcertA } from "@/lib/scales/generateScaleHalftones";

const bpmToMsPerBeat = (bpm: Bpm) => {
  return (1000 * 60) / bpm;
};

export type PitchProducerConfig = {
  piece: Piece;
  startTime: NonNegInteger;
  startNote: Note;
  bpm?: Bpm;
  startOctave?: NonNegInteger;
};

export const pitchProducer = (config: PitchProducerConfig) => (
  ms: NonNegInteger
): number => {
  const { piece, startTime, startNote, startOctave } = config;

  const timeFromStart = nonNegInteger(ms - startTime);

  // Play piece on loop.
  const beatsPerMin = config.bpm || bpm(60);
  const noteIndex =
    Math.floor(timeFromStart / bpmToMsPerBeat(beatsPerMin)) %
    piece.notes.length;

  // The piece's notes are represented as sequence of deltas (of semitones).
  const noteValue = piece.notes
    .slice(0, noteIndex + 1)
    .reduce((acc, cur) => acc + cur, 0);

  return noteToFrequency(
    noteValue +
      halftonesFromConcertA(startNote, startOctave || nonNegInteger(5))
  );
};
