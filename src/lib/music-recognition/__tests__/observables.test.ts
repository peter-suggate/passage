import { majorScaleSynth } from "@/lib/audio/synth/testing";
import { expectEvents$ } from "@/lib/testing/rx-testing";
import { recentDistinctNotes$, nearestNotes$ } from "@/lib/audio/analysis";
import { closestMatchingPieces$ } from "../observables";

describe("detecting closest music piece/scale from recorded notes", () => {
  it("returns the correct best match after 10 notes of a major scale have been played", async (done) => {
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
