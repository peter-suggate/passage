import { ScaleMode, scaleHalftone, ScaleHalftones } from "./scales-types";

const ht = scaleHalftone;

export const MODE_HALFTONES_ASCENDING: Record<ScaleMode, ScaleHalftones> = {
  major: [ht(0), ht(2), ht(4), ht(5), ht(7), ht(9), ht(11)],
  "harmonic minor": [ht(0), ht(2), ht(3), ht(5), ht(7), ht(8), ht(11)],
  "melodic minor": [ht(0), ht(2), ht(3), ht(5), ht(7), ht(9), ht(11)],
};

export const MODE_HALFTONES_DESCENDING: Record<ScaleMode, ScaleHalftones> = {
  major: MODE_HALFTONES_ASCENDING.major.slice().reverse() as ScaleHalftones,
  "harmonic minor": MODE_HALFTONES_ASCENDING["harmonic minor"]
    .slice()
    .reverse() as ScaleHalftones,
  "melodic minor": [ht(10), ht(8), ht(7), ht(5), ht(3), ht(2), ht(0)],
};

export const CONCERT_A_HALFTONE_INDEX = 69;
export const CONCERT_PITCH = 440.0;
