import { pitchProducer } from "../pitchProducer";
import { nonNegInteger } from "@/lib/scales";
import { lookupPiece, BuiltinPieces } from "@/lib/music-recognition";

it("produces expected pitches for twinkle", () => {
  expect(
    pitchProducer({
      startTime: nonNegInteger(0),
      piece: lookupPiece(BuiltinPieces.Twinkle),
      startNote: "A",
    })(nonNegInteger(0))
  ).toMatchInlineSnapshot(`440`);

  expect(
    pitchProducer({
      startTime: nonNegInteger(0),
      piece: lookupPiece(BuiltinPieces.Twinkle),
      startNote: "A",
    })(nonNegInteger(1000))
  ).toMatchInlineSnapshot(`659.2551138257398`);
});

it("throws error if attempting to get a pitch from the piece before the piece was started", () => {
  const pieceStartTime = nonNegInteger(5123);

  expect(() =>
    pitchProducer({
      startTime: nonNegInteger(pieceStartTime),
      piece: lookupPiece(BuiltinPieces.Twinkle),
      startNote: "C",
    })(nonNegInteger(0))
  ).toThrowError();
});

it("returns expected pitch when the piece was started late", () => {
  const pieceStartTime = nonNegInteger(4123);

  expect(
    pitchProducer({
      startTime: nonNegInteger(pieceStartTime),
      piece: lookupPiece(BuiltinPieces.Twinkle),
      startNote: "A",
    })(nonNegInteger(7500))
  ).toMatchInlineSnapshot(`659.2551138257398`);
});

describe("calculating pitch frequency at a given time after synth was started", () => {
  it("calculates correct frequencies all the way up the scale", () => {
    const cMajor = pitchProducer({
      startTime: nonNegInteger(0),
      piece: lookupPiece(BuiltinPieces.MajorScale),
      startNote: "C",
    });

    expect(
      new Array(8)
        .fill(undefined)
        .map((_, index) => cMajor(nonNegInteger((index + 1) * 1000 - 1)))
    ).toMatchInlineSnapshot(`
      Array [
        261.6255653005986,
        293.6647679174076,
        329.6275569128699,
        349.2282314330039,
        391.99543598174927,
        440,
        493.8833012561241,
        523.2511306011972,
      ]
    `);
  });
});
