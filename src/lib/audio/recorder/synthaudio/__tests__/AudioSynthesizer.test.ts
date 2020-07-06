import { AudioSynthesizer } from "../AudioSynthesizer";
import { expectEvents$ } from "@/lib/testing/rx-testing";

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
    mode: "major",
    scale: "A",
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
