import { expectEvents$ } from "../../../testing/rx-testing";
import { AudioRecorderEventTypes } from "../../recorder";
import { of } from "rxjs";
import { AudioOnsetEvent, AudioPitchEvent } from "../../audio-types";
import {
  activeNote$,
  frequencyToNearestNote,
  NearestNote,
} from "../nearestNote";

function pitchEvent(frequency: number = 440): AudioPitchEvent {
  return {
    type: "pitch",
    pitch: {
      clarity: 0.95,
      is_onset: false,
      frequency,
      t: 0,
      free: jest.fn(),
    },
  };
}

const pitchEvents = (frequencies: number[]): AudioPitchEvent[] =>
  frequencies.map((frequency, t) => ({
    type: "pitch",
    pitch: {
      clarity: 0.95,
      is_onset: false,
      frequency,
      t,
      free: jest.fn(),
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

  const expected = [{ value: "A", cents: 0 } as NearestNote];

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
    ].map((value) => ({ value, cents: 0 })),
    done
  );
});

it("produces the closest note when pitch is off", async (done) => {
  expectEvents$(
    activeNote$(of(...pitchEvents([450, 460]))),
    ["A", "A#"].map((value) => ({ value, cents: 0 })),
    done
  );
});

describe.only("frequencyToNearestNote", () => {
  it("", () => {
    expect(frequencyToNearestNote(440)).toEqual({
      value: "A",
      octave: 6,
      cents: 0,
    });
  });
});
