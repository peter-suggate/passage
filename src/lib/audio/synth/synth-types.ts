import { PitchProducerConfig } from "../recorder/synthaudio/pitchProducer";
import { musicBank } from "@/lib/music-recognition";
import { nonNegInteger } from "@/lib/scales";

export type Instrument = "bell" | "violin";

export type SynthesizerConfig = {
  instrument: Instrument;
} & PitchProducerConfig;

export const instruments: Instrument[] = ["bell", "violin"];

export const instrumentName = (instrument: Instrument): string => {
  switch (instrument) {
    case "bell":
      return "Bell-like (sinewave)";
    case "violin":
      return "Violin";
  }
};

export const defaultSynthConfig = (): SynthesizerConfig => ({
  instrument: "bell",
  piece: musicBank()[0],
  startTime: nonNegInteger(0),
  startNote: "A",
  // bpm: bpm;
  // startOctave?: NonNegInteger;
});
