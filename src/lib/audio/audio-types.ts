import { Pitch } from "music-analyzer-wasm-rs";

/**
 * Events that are emitted by the main thread recorder node.
 */

export type AudioPitchEvent = {
  type: "pitch";
  pitch: Omit<Pitch, "free">;
};

export type AudioOnsetEvent = {
  type: "onset";
  t: number;
};
