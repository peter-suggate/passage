import {
  distinctNote,
  distinctNote$,
  recentDistinctNotesByTime$,
  filterTransitionNote,
} from "../analysis-observables";
import { AnalyzedNote, makeNote } from "../analysis-types";
import { majorScaleSynth } from "../../synth/testing";
import { expectEvents$ } from "@/lib/testing/rx-testing";
import { Note, seconds } from "@/lib/scales";
import { nearestNotes$ } from "../analyzer";
import { of } from "rxjs";

describe("calculating representative distinct note from a consecutive run of pitches", () => {
  it("returns correct note when there's only one pitch", () => {
    const pitch = {
      age: 0,
      cents: -23,
      clarity: 0.9,
      octave: 4,
      t: 0,
      value: "D",
    } as AnalyzedNote;

    expect(distinctNote([pitch])).toEqual(pitch);
  });

  it("returns averaged cents and clarity note when there're multiple pitches", () => {
    expect(
      distinctNote([
        {
          age: 0,
          cents: 12,
          clarity: 0.91,
          octave: 4,
          t: 0.0,
          value: "D",
        },
        {
          age: 0,
          cents: -22,
          clarity: 0.8,
          octave: 4,
          t: 1.0,
          value: "D",
        },
      ])
    ).toEqual({
      age: 0,
      cents: -5,
      clarity: 0.855,
      octave: 4,
      t: 0,
      value: "D",
    });
  });

  it("uses the first note's time", () => {
    expect(
      distinctNote([
        {
          age: 0,
          cents: 12,
          clarity: 0.91,
          octave: 4,
          t: 0.3,
          value: "D",
        },
        {
          age: 0,
          cents: -22,
          clarity: 0.8,
          octave: 4,
          t: 1.0,
          value: "D",
        },
      ]).t
    ).toBe(0.3);
  });
});

describe("filtering out intermediate passing notes between plateaus", () => {
  it("doesn't emit unless enough notes are present", async () => {
    const n = makeNote;

    // Not enough notes/pitches
    expect(
      await of(n("C#"))
        .pipe(filterTransitionNote())
        .toPromise()
    ).toBeUndefined();

    // Still not enough..
    expect(
      await of(n("A"), n("A"))
        .pipe(filterTransitionNote())
        .toPromise()
    ).toBeUndefined();

    // Not enough consecutive notes of same type.
    expect(
      await of(n("A"), n("A"), n("B"), n("B"), n("C"))
        .pipe(filterTransitionNote())
        .toPromise()
    ).toBeUndefined();
  });

  it("emits multiple notes, skipping isolated notes", async (done) => {
    const n = makeNote;

    expectEvents$(
      of(n("A"), n("A"), n("A"), n("A#"), n("B"), n("B"), n("B")).pipe(
        filterTransitionNote()
      ),
      ["A", "A", "A", "B", "B", "B"],
      done,
      undefined,
      (e) => e.value
    );
  });
});

describe("observable that generates distinct notes from runs of note pitches", () => {
  it("emits expected notes of the scale", async (done) => {
    const NOTES_PER_SECOND = 7;

    const synth = await majorScaleSynth(60 * NOTES_PER_SECOND, 1024);

    expect(
      expectEvents$<AnalyzedNote, Note>(
        distinctNote$(nearestNotes$(synth)),
        ["C", "D", "E", "F", "G"],
        done,
        undefined,
        (e) => e.value
      )
    );

    for (let n = 1; n <= NOTES_PER_SECOND; n++) {
      synth.tick(synth.produceFrame((n * 1000) / NOTES_PER_SECOND - 1));
    }
  });

  it("emits notes with expected start times", async (done) => {
    const n = makeNote;

    expect(
      expectEvents$<AnalyzedNote, number>(
        distinctNote$(
          of(
            n("A", 0),
            n("A", 1),
            n("A", 2),
            n("C", 3),
            n("C", 4),
            n("C", 5),
            n("D", 6),
            n("D", 7),
            n("D", 8)
          )
        ),
        [0, 3, 6], // notes A and C begin at t=0, 3 respectively.
        done,
        undefined,
        (e) => e.t
      )
    );
  });

  it("emits notes with averaged intonation accuracy", async (done) => {
    const n = makeNote;

    expect(
      expectEvents$<AnalyzedNote, number>(
        distinctNote$(
          of(n("A", 0, -10), n("A", 1, -5), n("A", 2, -5), n("A", 2, -10))
        ),
        [-7.5],
        done,
        undefined,
        (e) => e.cents
      )
    );
  });

  it("emits notes with averaged clarity", async (done) => {
    const n = makeNote;

    expect(
      expectEvents$<AnalyzedNote, number>(
        distinctNote$(
          of(
            n("A", 0, 0, 0.91),
            n("A", 1, 0, 0.8),
            n("A", 2, 0, 0.91),
            n("A", 2, 0, 0.8)
          )
        ),
        [0.855],
        done,
        undefined,
        (e) => e.clarity
      )
    );
  });
});

describe("observable that buffers latest T seconds of distinct events", () => {
  it("emits all notes when they're within the time window", async (done) => {
    const synth = await majorScaleSynth();

    expectEvents$<AnalyzedNote[], Note[]>(
      recentDistinctNotesByTime$(nearestNotes$(synth), seconds(15)),
      [
        ["C"],
        ["C", "D"],
        ["C", "D", "E"],
        ["C", "D", "E", "F"],
        ["C", "D", "E", "F", "G"],
        ["C", "D", "E", "F", "G", "A"],
        ["C", "D", "E", "F", "G", "A", "B"],
        ["C", "D", "E", "F", "G", "A", "B", "C"],
        ["C", "D", "E", "F", "G", "A", "B", "C", "B"],
        // ["C", "D", "E", "F", "G", "A", "B", "C", "B", "A"],
      ],
      done,
      undefined,
      (e) => e.map((p) => p.value)
    );

    for (let n = 1; n < 12; n++) {
      synth.tick(synth.produceFrame(n * 1000 - 1));
    }
  });

  it("omits notes that begin outside the time window", async (done) => {
    const n = makeNote;
    const ns = (note: Note, t: number) =>
      new Array(3).fill(undefined).map(() => n(note, t));

    expectEvents$(
      recentDistinctNotesByTime$(
        of(
          ...ns("A", 0),
          n("A#", 0.5), // Isolated note to be filtered out.
          ...ns("B", 1),
          ...ns("C", 2),
          ...ns("D", 3)
        ),
        seconds(2.5)
      ),
      [["A"], ["A", "B"], ["A", "B", "C"], ["B", "C", "D"]],
      done,
      undefined,
      (e) => e.map((p) => p.value)
    );
  });
});
