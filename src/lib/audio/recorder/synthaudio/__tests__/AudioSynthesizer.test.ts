import { AudioSynthesizer, pitchAtMs } from "../AudioSynthesizer";
import { expectEvents$ } from "@/lib/testing/rx-testing";
import { bpm, posInteger, nonNegInteger } from "@/lib/scales";
import { partialImpl } from "@/lib/testing/partial-impl";
import { SynthesizerConfig } from "@/lib/audio/synth/synth-types";

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

describe("calculating pitch frequency at a given time after synth was started", () => {
  it("calculates correct frequencies all the way up the scale", () => {
    const cMajor = partialImpl<SynthesizerConfig>({
      scaleType: {
        scale: { tonic: "C", mode: "major" },
        octaves: posInteger(1),
        startOctave: nonNegInteger(4),
      },
      bpm: bpm(60),
    });

    expect(
      new Array(8)
        .fill(undefined)
        .map((_, index) => pitchAtMs((index + 1) * 1000 - 1, cMajor))
    ).toMatchInlineSnapshot(`
      Array [
        130.8127826502993,
        146.8323839587038,
        164.81377845643496,
        174.61411571650194,
        195.99771799087463,
        220,
        246.94165062806206,
        261.6255653005986,
      ]
    `);
  });
});
