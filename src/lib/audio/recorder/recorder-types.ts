import { Pitch } from "music-analyzer-wasm-rs";
import { AudioOnsetEvent, AudioPitchEvent } from "../audio-types";

/**
 * Events that come out of the audio worklet processor.
 */
export type AudioProcessorEventTypes =
  | {
      type: "initialized";
    }
  | {
      type: "pitches";
      result: Pitch[];
    };

export type AudioRecorderEventTypes = AudioOnsetEvent | AudioPitchEvent;

export type AudioContextMin = Pick<
  AudioContext,
  "state" | "suspend" | "resume"
>;

export type Suspendable = {
  suspend(): Promise<void>;
  resume(): Promise<void>;
};
