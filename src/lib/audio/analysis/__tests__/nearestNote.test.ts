import { expectEvents$ } from "../../../testing/rx-testing";
import { of } from "rxjs";
import { AudioOnsetEvent, AudioPitchEvent } from "../../audio-types";
import { activeNote$, frequencyToNearestNote } from "../nearestNote";
import { noteToFrequency } from "..";
import { AnalyzedNote } from "../analysis-types";

function pitchEvent(frequency: number = 440): AudioPitchEvent {
  return {
    type: "pitch",
    pitch: {
      clarity: 0.95,
      onset: false,
      frequency,
      t: 0,
    },
  };
}

const pitchEvents = (frequencies: number[]): AudioPitchEvent[] =>
  frequencies.map((frequency, t) => ({
    type: "pitch",
    pitch: {
      clarity: 0.95,
      onset: false,
      frequency,
      t,
    },
  }));

function onsetEvent(t = 0): AudioOnsetEvent {
  return {
    type: "onset",
    t,
  };
}

it("ignores onset events", async (done) => {
  const events = [onsetEvent(), pitchEvent(440), onsetEvent()];

  const expected = [{ value: "A", cents: 0 } as AnalyzedNote];

  expectEvents$(activeNote$(of(...events)), expected, done);
});

it("produces correct notes for a C Major scale", async (done) => {
  expectEvents$(
    activeNote$(
      of(
        ...pitchEvents([
          261.63,
          277.18,
          293.66,
          311.13,
          329.63,
          349.23,
          369.99,
          392.0,
          415.3,
          440.0,
          466.16,
          493.88,
          523.25,
        ])
      )
    ),
    [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
      "C",
    ].map((value) => ({ value /*, cents: 0*/ })),
    done
  );
});

it("produces the closest note when pitch is off", async (done) => {
  expectEvents$(
    activeNote$(of(...pitchEvents([450, 460]))),
    [
      {
        value: "A",
        cents: 38.90577323085291,
      },
      {
        value: "A#",
        cents: -23.04359509634124,
      },
    ],
    // ["A", "A#"].map((value) => ({ value, cents: 0 })),
    done
  );
});

describe("frequencyToNearestNote", () => {
  it("calculates correct note value and octave for concert A", () => {
    expect(frequencyToNearestNote(440)).toEqual({
      value: "A",
      octave: 5,
      cents: 0,
    });
  });

  it("calculates correct note value and octave for a note an octave below concert A", () => {
    expect(frequencyToNearestNote(220)).toEqual({
      value: "A",
      octave: 4,
      cents: 0,
    });
  });
});

describe("noteToFrequency", () => {
  it("converts concert A correctly", () => {
    expect(noteToFrequency(0)).toBe(440);
  });

  it("handles octaves above correctly", () => {
    expect(noteToFrequency(-12)).toBe(220);

    expect(noteToFrequency(12)).toBe(880);
  });
});
