import { AudioSynthesizer } from "../recorder/synthaudio/AudioSynthesizer";
import { bpm, nonNegInteger } from "@/lib/scales";
import { lookupPiece, BuiltinPieces } from "@/lib/music-recognition";

export async function majorScaleSynth(BPM = 60, windowSamples = 2048) {
  const synth = await AudioSynthesizer.create(
    {
      instrument: "bell",
      piece: lookupPiece(BuiltinPieces.MajorScale),
      startTime: nonNegInteger(0),
      startNote: "C",
      bpm: bpm(BPM),
    },
    windowSamples,
    0.7,
    0.75
  );

  return synth;
}
