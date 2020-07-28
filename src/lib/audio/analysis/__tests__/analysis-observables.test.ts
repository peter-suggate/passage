import {
  distinctNote,
  distinctNote$,
  recentDistinctNotesByTime$,
} from "../analysis-observables";
import { AnalyzedNote } from "../analysis-types";
import { majorScaleSynth } from "../../synth/testing";
import { expectEvents$ } from "@/lib/testing/rx-testing";
import { Note, posNumber } from "@/lib/scales";
import { nearestNotes$ } from "../analyzer";
import { of } from "rxjs";
import { filterInBetweenNotes } from "../analysis-operators";
import { tap } from "rxjs/operators";

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

const makeNote = (
  value: Note = "A",
  t = 0,
  cents = 0,
  clarity = 0.9
): AnalyzedNote => ({
  age: t,
  cents,
  clarity,
  octave: 4,
  t,
  value,
});

describe("filtering out intermediate passing notes between plateaus", () => {
  it("doesn't emit unless enough notes are present", async () => {
    const n = makeNote;

    // Not enough notes/pitches
    expect(
      await of(n("C#"))
        .pipe(filterInBetweenNotes())
        .toPromise()
    ).toBeUndefined();

    // Still not enough..
    expect(
      await of(n("A"), n("A"))
        .pipe(filterInBetweenNotes())
        .toPromise()
    ).toBeUndefined();

    // Not enough consecutive notes of same type.
    expect(
      await of(n("A"), n("A"), n("B"), n("B"), n("C"))
        .pipe(filterInBetweenNotes())
        .toPromise()
    ).toBeUndefined();
  });

  it("emits multiple notes", async (done) => {
    const n = makeNote;

    expectEvents$(
      of(n("A"), n("A"), n("A"), n("A"), n("B"), n("B"), n("B")).pipe(
        filterInBetweenNotes()
      ),
      [
        { age: 0, cents: 0, clarity: 0.9, octave: 4, t: 0, value: "A" },
        { age: 0, cents: 0, clarity: 0.9, octave: 4, t: 0, value: "A" },
        { age: 0, cents: 0, clarity: 0.9, octave: 4, t: 0, value: "B" },
      ],
      done
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
        ["C", "D", "E", "F", "G", "A"],
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
          of(n("A", 0), n("A", 1), n("A", 2), n("C", 3), n("C", 4), n("C", 5))
        ),
        [0, 3], // notes A and C begin at t=0, 3 respectively.
        done,
        undefined,
        (e) => e.t
      )
    );
  });
});

describe("observable that buffers latest T seconds of distinct events", () => {
  it("emits all notes when they're within the time window", async (done) => {
    const synth = await majorScaleSynth();

    expectEvents$<AnalyzedNote[], Note[]>(
      recentDistinctNotesByTime$(nearestNotes$(synth), posNumber(15)),
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
        ["C", "D", "E", "F", "G", "A", "B", "C", "B", "A"],
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
    const synth = await majorScaleSynth();

    expectEvents$<AnalyzedNote[], Note[]>(
      recentDistinctNotesByTime$(nearestNotes$(synth), posNumber(2.5)),
      [
        ["C"],
        ["C", "D"],
        ["C", "D", "E"],
        ["D", "E", "F"],
        ["E", "F", "G"],
        ["F", "G", "A"],
        ["G", "A", "B"],
        ["A", "B", "C"],
        ["B", "C", "B"],
        ["C", "B", "A"],
      ],
      done,
      undefined,
      (e) => e.map((p) => p.value)
    );

    for (let n = 1; n < 12; n++) {
      synth.tick(synth.produceFrame(n * 1000 - 1));
    }
  });
});
