import { allEvents$, expectEvents$ } from "@/lib/testing/rx-testing";
import { nearestNotes$, recentDistinctNotes$ } from "../analyzer";
import { AudioSynthesizer } from "../../recorder/synthaudio/AudioSynthesizer";
import { bpm, nonNegInteger, posInteger, Note } from "@/lib/scales";
import { NearestNote } from "../nearestNote";

async function majorScaleSynth(BPM = 60) {
  return await AudioSynthesizer.create({
    bpm: bpm(BPM),
    instrument: "bell",
    scaleType: {
      scale: { tonic: "C", mode: "major" },
      octaves: posInteger(1),
      startOctave: nonNegInteger(4),
    },
  });
}

xit("returns all expected notes", async (done) => {
  const synth = await majorScaleSynth(60 * 4);

  expect(
    allEvents$<NearestNote>(
      nearestNotes$(synth),
      (events) => {
        expect(
          events.map((e: NearestNote) => ({ note: e.value, cents: e.cents }))
        ).toMatchInlineSnapshot();
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
  it("ignores repeated notes", async (done) => {
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

    for (let n = 1; n < 15; n++) {
      synth.tick(synth.produceFrame(n * 1000 - 1));
    }
  });
});
