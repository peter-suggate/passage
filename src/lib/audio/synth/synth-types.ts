import {
  Bpm,
  bpm,
  posInteger,
  OctavesScale,
  nonNegInteger,
} from "@/lib/scales";

export type Instrument = "bell" | "violin";

export type SynthesizerConfig = {
  instrument: Instrument;
  scaleType: OctavesScale;
  bpm: Bpm;
};

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
  scaleType: {
    scale: { tonic: "A", mode: "major" },
    startOctave: nonNegInteger(2),
    octaves: posInteger(1),
  },
  bpm: bpm(60),
});
