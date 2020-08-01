import { allEvents$, expectEvents$ } from "@/lib/testing/rx-testing";
import { nearestNotes$, recentDistinctNotes$ } from "../analyzer";
import { Note, posInteger } from "@/lib/scales";
import { majorScaleSynth } from "../../synth/testing";
import { AnalyzedNote } from "../analysis-types";
import { recentDistinctNotesByTime$ } from "../analysis-observables";
import { seconds } from "@/lib/passage-analysis";

it("returns all expected notes", async (done) => {
  const NOTES_PER_SECOND = 15;

  const synth = await majorScaleSynth(60 * NOTES_PER_SECOND, 1024);

  expect(
    allEvents$<AnalyzedNote>(
      nearestNotes$(synth),
      (events) => {
        expect(
          events.map(
            (e: AnalyzedNote) => e.value /*({ note: e.value, cents: e.cents })*/
          )
        ).toMatchSnapshot();
      },
      done
    )
  );

  for (let n = 1; n <= NOTES_PER_SECOND; n++) {
    synth.tick(synth.produceFrame((n * 1000) / NOTES_PER_SECOND - 1));
  }

  synth.complete();
});

describe("calculating N last distinct notes", () => {
  it("removes repeated notes", async (done) => {
    const synth = await majorScaleSynth();

    expectEvents$<AnalyzedNote[], Note[]>(
      recentDistinctNotes$(nearestNotes$(synth), posInteger(5)),
      [["C"], ["C", "D"], ["C", "D", "E"], ["C", "D", "E", "F"]],
      done,
      undefined,
      (e) => e.map((p) => p.value)
    );

    for (let n = 1; n < 5; n++) {
      synth.tick(synth.produceFrame(n * 1000 - 1));
    }

    synth.complete();
  });

  it("keeps only the last N notes", async (done) => {
    const synth = await majorScaleSynth();

    expectEvents$<AnalyzedNote[], Note[]>(
      recentDistinctNotes$(nearestNotes$(synth), posInteger(5)),
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
        ["B", "C", "B", "A", "G"],
      ],
      done,
      undefined,
      (e) => e.map((p) => p.value)
    );

    for (let n = 1; n < 12; n++) {
      synth.tick(synth.produceFrame(n * 1000 - 1));
    }

    synth.complete();
  });

  it("removes gliding / passing notes because they interfere with music recognition", async (done) => {
    const NOTES_PER_SECOND = 15;

    const synth = await majorScaleSynth(60 * NOTES_PER_SECOND, 1024);

    expect(
      expectEvents$<AnalyzedNote[], Note[]>(
        recentDistinctNotes$(nearestNotes$(synth), posInteger(5)),
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
          ["B", "C", "B", "A", "G"],
          ["C", "B", "A", "G", "F"],
          ["B", "A", "G", "F", "E"],
          ["A", "G", "F", "E", "D"],
          ["G", "F", "E", "D", "C"],
        ],
        done,
        undefined,
        (e) => e.map((p) => p.value)
      )
    );

    for (let n = 1; n <= NOTES_PER_SECOND; n++) {
      synth.tick(synth.produceFrame((n * 1000) / NOTES_PER_SECOND - 1));
    }

    synth.complete();
  });
});

describe("filtering notes to those within most recent N seconds", () => {
  it("returns last event for small window length", async (done) => {
    const bpm = 60;
    const synth = await majorScaleSynth(bpm);

    expectEvents$<AnalyzedNote[], Note[]>(
      recentDistinctNotesByTime$(nearestNotes$(synth), seconds(0.9)),
      [
        ["C"],
        ["D"], // Previous note in scale didn't fit inside the window.
      ],
      done,
      undefined,
      (e) => e.map((p) => p.value)
    );

    // Produce first note.
    synth.tick(synth.produceFrame(999));

    // Produce second note.
    synth.tick(synth.produceFrame(1999));

    synth.complete();
  });

  it("keeps only the last N notes", async (done) => {
    const synth = await majorScaleSynth();

    expectEvents$<AnalyzedNote[], Note[]>(
      recentDistinctNotes$(nearestNotes$(synth), posInteger(5)),
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
        ["B", "C", "B", "A", "G"],
      ],
      done,
      undefined,
      (e) => e.map((p) => p.value)
    );

    for (let n = 1; n < 12; n++) {
      synth.tick(synth.produceFrame(n * 1000 - 1));
    }

    synth.complete();
  });

  it("removes gliding / passing notes because they interfere with music recognition", async (done) => {
    const NOTES_PER_SECOND = 15;

    const synth = await majorScaleSynth(60 * NOTES_PER_SECOND, 1024);

    expect(
      expectEvents$<AnalyzedNote[], Note[]>(
        recentDistinctNotes$(nearestNotes$(synth), posInteger(5)),
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
          ["B", "C", "B", "A", "G"],
          ["C", "B", "A", "G", "F"],
          ["B", "A", "G", "F", "E"],
          ["A", "G", "F", "E", "D"],
          ["G", "F", "E", "D", "C"],
        ],
        done,
        undefined,
        (e) => e.map((p) => p.value)
      )
    );

    for (let n = 1; n <= NOTES_PER_SECOND; n++) {
      synth.tick(synth.produceFrame((n * 1000) / NOTES_PER_SECOND - 1));
    }

    synth.complete();
  });
});
