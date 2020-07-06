import { AudioSynthesizer } from "../AudioSynthesizer";
import { expectEvents$ } from "@/lib/testing/rx-testing";
import { bpm, posInteger, nonNegInteger } from "@/lib/scales";

// Not sure how to test this..
// it("produces no events until started", async (done) => {
//   const node = await AudioSynthesizer.create({
//     instrument: "bell",
//     mode: "major",
//     scale: "A",
//   });

//   expectEvents$(node, [], done);
// });

test("when started, produces an initial onset event", async (done) => {
  const node = await AudioSynthesizer.create({
    instrument: "bell",
    scaleType: {
      scale: { tonic: "A", mode: "major" },
      octaves: posInteger(1),
      startOctave: nonNegInteger(4),
    },
    bpm: bpm(60),
  });

  await node.resume();

  expectEvents$(
    node,
    [
      {
        type: "onset",
        // t: ?,
      },
    ],
    done
  );
});
