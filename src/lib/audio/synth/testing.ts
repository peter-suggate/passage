import { AudioSynthesizer } from "../recorder/synthaudio/AudioSynthesizer";
import { bpm, posInteger, nonNegInteger } from "@/lib/scales";

export async function majorScaleSynth(BPM = 60, windowSamples = 2048) {
  return await AudioSynthesizer.create(
    {
      bpm: bpm(BPM),
      instrument: "bell",
      scaleType: {
        scale: { tonic: "C", mode: "major" },
        octaves: posInteger(1),
        startOctave: nonNegInteger(5),
      },
    },
    windowSamples,
    0.7,
    0.75
  );
}
