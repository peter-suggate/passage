import { allEvents$, expectEvents$ } from "@/lib/testing/rx-testing";
import { nearestNotes$, recentDistinctNotes$ } from "../analyzer";
import { Note } from "@/lib/scales";
import { majorScaleSynth } from "../../synth/testing";
import { NearestNote } from "../analysis-types";

it("returns all expected notes", async (done) => {
  const NOTES_PER_SECOND = 15;

  const synth = await majorScaleSynth(60 * NOTES_PER_SECOND, 1024);

  expect(
    allEvents$<NearestNote>(
      nearestNotes$(synth),
      (events) => {
        expect(
          events.map(
            (e: NearestNote) => e.value /*({ note: e.value, cents: e.cents })*/
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

    expectEvents$<NearestNote[], Note[]>(
      recentDistinctNotes$(nearestNotes$(synth), 5),
      [["C"], ["C", "D"], ["C", "D", "E"], ["C", "D", "E", "F"]],
      done,
      undefined,
      (e) => e.map((p) => p.value)
    );

    for (let n = 1; n < 5; n++) {
      synth.tick(synth.produceFrame(n * 1000 - 1));
    }
  });

  it("keeps only the last N notes", async (done) => {
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
        ["B", "C", "B", "A", "G"],
      ],
      done,
      undefined,
      (e) => e.map((p) => p.value)
    );

    for (let n = 1; n < 12; n++) {
      synth.tick(synth.produceFrame(n * 1000 - 1));
    }
  });

  it("removes gliding / passing notes because they interfere with music recognition", async (done) => {
    const NOTES_PER_SECOND = 15;

    const synth = await majorScaleSynth(60 * NOTES_PER_SECOND, 1024);

    expect(
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
  });
});
