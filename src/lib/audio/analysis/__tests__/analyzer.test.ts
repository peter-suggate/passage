import { allEvents$, expectEvents$ } from "@/lib/testing/rx-testing";
import {
  nearestNotes$,
  recentDistinctNotes$,
  closestMatchingPieces$
} from "../analyzer";
import { AudioSynthesizer } from "../../recorder/synthaudio/AudioSynthesizer";
import { bpm, nonNegInteger, posInteger, Note } from "@/lib/scales";
import { NearestNote } from "../nearestNote";

async function majorScaleSynth(BPM = 60, windowSamples = 2048) {
  return await AudioSynthesizer.create(
    {
      bpm: bpm(BPM),
      instrument: "bell",
      scaleType: {
        scale: { tonic: "C", mode: "major" },
        octaves: posInteger(1),
        startOctave: nonNegInteger(4)
      }
    },
    windowSamples,
    0.7,
    0.75
  );
}

it("returns all expected notes", async done => {
  const synth = await majorScaleSynth(60 * 4, 4096);

  expect(
    allEvents$<NearestNote>(
      nearestNotes$(synth),
      events => {
        expect(
          events.map((e: NearestNote) => ({ note: e.value, cents: e.cents }))
        ).toMatchInlineSnapshot(`
          Array [
            Object {
              "cents": 24.901289632674132,
              "note": "C",
            },
            Object {
              "cents": -13.869578561794148,
              "note": "C#",
            },
            Object {
              "cents": -13.869578561794148,
              "note": "C#",
            },
            Object {
              "cents": 40.5428491241758,
              "note": "C#",
            },
            Object {
              "cents": 40.5428491241758,
              "note": "C#",
            },
            Object {
              "cents": -6.938983271458416,
              "note": "D",
            },
            Object {
              "cents": -6.938983271458416,
              "note": "D",
            },
            Object {
              "cents": 3.3127191104562583,
              "note": "D",
            },
            Object {
              "cents": 3.3127191104562583,
              "note": "D",
            },
            Object {
              "cents": 0.16045109362804436,
              "note": "D",
            },
            Object {
              "cents": 0.16045109362804436,
              "note": "D",
            },
            Object {
              "cents": 4.977388848550697,
              "note": "D",
            },
            Object {
              "cents": 4.977388848550697,
              "note": "D",
            },
            Object {
              "cents": 7.22139551538934,
              "note": "D",
            },
            Object {
              "cents": 7.22139551538934,
              "note": "D",
            },
            Object {
              "cents": 1.9970813623771848,
              "note": "D",
            },
            Object {
              "cents": 0.7173095994016438,
              "note": "D",
            },
            Object {
              "cents": 6.185896071465069,
              "note": "D",
            },
            Object {
              "cents": 6.442767731055183,
              "note": "D",
            },
            Object {
              "cents": 41.87941546783418,
              "note": "D",
            },
            Object {
              "cents": 0.7867292082545221,
              "note": "D#",
            },
            Object {
              "cents": -43.29536620059206,
              "note": "E",
            },
          ]
        `);
      },
      done
    )
  );

  synth.tick(synth.produceFrame(249));
  synth.tick(synth.produceFrame(499));
  synth.tick(synth.produceFrame(749));

  synth.complete();
});

describe("calculating N last distinct notes", () => {
  it("ignores repeated notes", async done => {
    const synth = await majorScaleSynth();

    expectEvents$<NearestNote[], Note[]>(
      recentDistinctNotes$(nearestNotes$(synth), 5),
      [["C"], ["C", "D"], ["C", "D", "E"], ["C", "D", "E", "F"]],
      done,
      undefined,
      e => e.map(p => p.value)
    );

    for (let n = 1; n < 5; n++) {
      synth.tick(synth.produceFrame(n * 1000 - 1));
    }
  });

  it("keeps only the last N notes", async done => {
    const synth = await majorScaleSynth();

    expectEvents$<NearestNote[], Note[]>(
      recentDistinctNotes$(nearestNotes$(synth), 5),
      [
        ["C"],
        ["C", "D"],
        ["C", "D", "E"],
        ["C", "D", "E", "F"],
        ["C", "D", "E", "F", "G"],
        ["D", "E", "F", "G", "A"],
        ["E", "F", "G", "A", "B"],
        ["F", "G", "A", "B", "C"],
        ["G", "A", "B", "C", "B"],
        ["A", "B", "C", "B", "A"],
        ["B", "C", "B", "A", "G"]
      ],
      done,
      undefined,
      e => e.map(p => p.value)
    );

    for (let n = 1; n < 12; n++) {
      synth.tick(synth.produceFrame(n * 1000 - 1));
    }
  });
});

describe("detecting closest music piece/scale from recorded notes", () => {
  it("returns the correct best match after 10 notes of a major scale have been played", async done => {
    const synth = await majorScaleSynth();

    const NOTES = 10;
    const MIN_NOTES = NOTES;
    const MAX_MATCHES = 1;

    expectEvents$(
      closestMatchingPieces$(
        MIN_NOTES,
        MAX_MATCHES
      )(recentDistinctNotes$(nearestNotes$(synth), NOTES)),
      [[{ piece: { name: "Major Scale" }, distance: 0 }]],
      done
    );

    for (let n = 1; n < NOTES + 1; n++) {
      synth.tick(synth.produceFrame(n * 1000 - 1));
    }
  });
});
