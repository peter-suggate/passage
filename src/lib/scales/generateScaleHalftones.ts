import {
  OctavesScale,
  ScaleHalftone,
  scaleHalftone,
  posInteger,
  Note,
  NonNegInteger,
  NOTES,
} from "./scales-types";
import {
  MODE_HALFTONES_ASCENDING,
  MODE_HALFTONES_DESCENDING,
  CONCERT_A_HALFTONE_INDEX,
} from "./western-scales";

/**
 * Generates the half tones (indexes relative to the starting octave tonic) for
 * a multi-octave scale.
 *
 * @param config Object describing the scale tonic, mode and number of octaves
 * @param memo Optional map for memoizing results for efficient re-computation.
 *
 * @returns an array of half-tone degrees that make up the full multi-octave
 * scale.
 */
export const generateScaleHalftones = (
  config: Pick<OctavesScale, "octaves" | "scale">,
  memo?: Map<Pick<OctavesScale, "octaves" | "scale">, ScaleHalftone[]>
) => {
  const existing = memo && memo.get(config);
  if (existing) {
    return existing;
  }

  const { octaves, scale } = config;

  const fullScale = [];

  const scaleHalftonesAsc = MODE_HALFTONES_ASCENDING[scale.mode];

  // Generate ascending halftones for as many octaves as needed.
  for (let octave = 0; octave < octaves; octave++) {
    const octaveStart = octave * 12; // halftones in an octave

    for (let d = 0; d < scaleHalftonesAsc.length; d++) {
      fullScale.push(
        scaleHalftone(
          octaveStart + scaleHalftonesAsc[d],
          posInteger(octave + 1)
        )
      );
    }
  }

  // Add the top note (which technically resides in the octave above).
  fullScale.push(scaleHalftone(octaves * 12, posInteger(octaves + 1)));

  // Go back down the scale.
  const scaleHalftonesDesc = MODE_HALFTONES_DESCENDING[scale.mode];
  for (let octave = octaves - 1; octave >= 0; octave--) {
    const octaveStart = octave * 12; // halftones in an octave

    for (let d = 0; d < scaleHalftonesDesc.length; d++) {
      fullScale.push(
        scaleHalftone(
          octaveStart + scaleHalftonesDesc[d],
          posInteger(octave + 1)
        )
      );
    }
  }

  // Cache results for next time.
  memo && memo.set(config, fullScale);

  return fullScale;
};

export const halftonesFromConcertA = (
  note: Note,
  octave: NonNegInteger
): number => {
  return NOTES.indexOf(note) + octave * 12 - CONCERT_A_HALFTONE_INDEX;
};
