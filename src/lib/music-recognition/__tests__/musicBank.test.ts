import { TWINKLE, MAJOR_SCALE } from "../musicBank";

test("major scale has expected note deltas", () => {
  expect(MAJOR_SCALE.noteDeltas).toMatchInlineSnapshot(`
    Array [
      0,
      2,
      2,
      1,
      2,
      2,
      2,
      1,
      -1,
      -2,
      -2,
      -2,
      -1,
      -2,
      -2,
    ]
  `);
});

test("twinkle has expected note deltas", () => {
  expect(TWINKLE.noteDeltas).toMatchInlineSnapshot(`
    Array [
      0,
      7,
      2,
      -2,
      -2,
      -1,
      -2,
      -2,
      7,
      -2,
      -1,
      -2,
      5,
      -2,
      -1,
      -2,
      -2,
      7,
      2,
      -2,
      -2,
      -1,
      -2,
      -2,
    ]
  `);
});
