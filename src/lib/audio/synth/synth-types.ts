import { Note } from "../analysis";

export type Instrument = "bell" | "violin";

export type SynthesizerConfig = {
  instrument: Instrument;
  mode: "major" | "minor";
  scale: Note;
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
  mode: "major",
  scale: "C",
});
