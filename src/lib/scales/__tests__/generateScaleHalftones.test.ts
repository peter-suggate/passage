import { scaleHalftone, posInteger, nonNegInteger } from "../scales-types";
import {
  generateScaleHalftones,
  halftonesFromConcertA,
} from "../generateScaleHalftones";

const ht = scaleHalftone;

it("produces correct notes for a single octave major scale", () => {
  expect(
    generateScaleHalftones(
      {
        octaves: posInteger(1),
        scale: { tonic: "A", mode: "major" },
      },
      new Map()
    )
  ).toEqual([0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0]);
});

it("produces correct notes for a two octave C melodic minor scale", () => {
  expect(
    generateScaleHalftones(
      {
        octaves: posInteger(2),
        scale: { tonic: "C", mode: "melodic minor" },
      },
      new Map()
    )
  ).toEqual([
    0,
    2,
    3,
    5,
    7,
    9,
    11,
    12,
    14,
    15,
    17,
    19,
    21,
    23,
    24,
    22,
    20,
    19,
    17,
    15,
    14,
    12,
    10,
    8,
    7,
    5,
    3,
    2,
    0,
  ]);
});

describe("halftonesFromConcertA", () => {
  test("returns 0 for concert A iteslef", () => {
    expect(halftonesFromConcertA("A", nonNegInteger(5))).toBe(0);
  });
});
