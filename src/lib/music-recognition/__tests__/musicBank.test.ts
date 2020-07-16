import { TWINKLE } from "../musicBank";

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
