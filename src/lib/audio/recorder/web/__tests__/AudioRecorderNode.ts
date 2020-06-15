import { AudioAnalyzerNode } from "../AudioRecorderNode";
import "../../test-fixtures/AudioContext";
import { requireRight } from "../../../../testing/fp-testing";
import { Pitch } from "music-analyzer-wasm-rs/music_analyzer_wasm_rs";
import { AudioPitchEvent } from "../../../audio-types";
import { expectEvents$ } from "../../../../testing/rx-testing";
import { AudioRecorderEventTypes } from "../../recorder-types";

function pitch(
  t = 0,
  is_onset: boolean = false,
  frequency: number = 440,
  clarity = 0.95
): Pitch {
  return {
    clarity,
    is_onset,
    frequency,
    t,
    free: jest.fn(),
  };
}

describe("when pitches event arrives from the processor", () => {
  it("emits a pitch event for each pitch in the result", async (done) => {
    const analyzer = requireRight(
      await AudioAnalyzerNode.create(new globalThis.AudioContext())()
    );

    const pitches = [pitch(34, true), pitch(35, false), pitch(36, true)];

    const expected: AudioPitchEvent[] = pitches.map((pitch) => ({
      type: "pitch",
      pitch,
    }));

    expectEvents$(analyzer, expected, done, (event) => event.type === "pitch");

    analyzer.onmessage({
      type: "pitches",
      result: pitches,
    });
  });

  it("emits onset events for each onset pitch", async (done) => {
    const analyzer = requireRight(
      await AudioAnalyzerNode.create(new globalThis.AudioContext())()
    );

    const pitches = [pitch(123, true), pitch(445, false), pitch(12348, true)];

    const expected: AudioRecorderEventTypes[] = [
      { type: "onset", t: 123 },
      { type: "onset", t: 12348 },
    ];

    expectEvents$(analyzer, expected, done, (event) => event.type === "onset");

    analyzer.onmessage({
      type: "pitches",
      result: pitches,
    });
  });
});
