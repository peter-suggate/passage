import { phraseMatch, pieceMatch } from "../phraseMatch";
import { TWINKLE, FRENCH_FOLK_SONG, musicBank } from "../musicBank";
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

  it("matches major scale on a descending phrase", () => {
    console.log(PhraseBuilder().push("B", "A", "G", "F#", "E", "D").noteDeltas);

    expect(
      pieceMatch(
        PhraseBuilder().push("B", "A", "G", "F#", "E", "D").noteDeltas,
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
