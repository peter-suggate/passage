import { phraseMatch, pieceMatch, closestMatches } from "../phraseMatch";
import {
  TWINKLE,
  FRENCH_FOLK_SONG,
  musicBank,
  MAJOR_SCALE
} from "../musicBank";
import { PhraseBuilder } from "../PhraseBuilder";

it("returns exact match when correct notes from beginning are used", () => {
  expect(phraseMatch(TWINKLE.noteDeltas.slice(0, 6), TWINKLE.noteDeltas)).toBe(
    0
  );
});

it("returns exact match when correct notes from partway through are used", () => {
  expect(phraseMatch(TWINKLE.noteDeltas.slice(5, 5), TWINKLE.noteDeltas)).toBe(
    0
  );
});

it("returns weak approximate match when phrase from a different piece is used", () => {
  expect(
    phraseMatch(FRENCH_FOLK_SONG.noteDeltas.slice(0, 10), TWINKLE.noteDeltas)
  ).toBe(5);
});

describe("finding closest matching piece to a phrase", () => {
  it("matches major scale in any key", () => {
    expect(
      pieceMatch(
        PhraseBuilder().push("D", "E", "F#", "G").noteDeltas,
        musicBank()
      )
    ).toBe("Major Scale");
  });

  it("matches harmonic minor scale in any key", () => {
    expect(
      pieceMatch(
        PhraseBuilder().push("D", "E", "F", "G", "A", "A#").noteDeltas,
        musicBank()
      )
    ).toBe("Harmonic Minor Scale");
  });
});

describe("finding multiple closest matches", () => {
  it("matches correctly on a descending scale fragment", () => {
    expect(
      closestMatches(
        PhraseBuilder().push("B", "A", "G", "F#", "E", "D").noteDeltas,
        musicBank()
      ).map(val => ({ name: val.piece.name, distance: val.distance }))
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "distance": 1,
          "name": "Twinkle",
        },
        Object {
          "distance": 1,
          "name": "French Folk Song",
        },
        Object {
          "distance": 1,
          "name": "Major Scale",
        },
        Object {
          "distance": 1,
          "name": "Melodic Minor Scale",
        },
        Object {
          "distance": 3,
          "name": "Harmonic Minor Scale",
        },
      ]
    `);
  });
});
