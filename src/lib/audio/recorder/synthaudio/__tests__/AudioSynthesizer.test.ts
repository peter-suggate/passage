import { AudioSynthesizer } from "../AudioSynthesizer";
import { expectEvents$ } from "@/lib/testing/rx-testing";
import { lookupPiece, BuiltinPieces } from "@/lib/music-recognition";
import { nonNegInteger } from "@/lib/scales";

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
    piece: lookupPiece(BuiltinPieces.MajorScale),
    startTime: nonNegInteger(0),
    startNote: "A",
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
