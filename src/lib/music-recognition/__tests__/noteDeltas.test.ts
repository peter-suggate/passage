import { noteDeltas } from "../noteDeltas";
import { integer } from "@/lib/scales";

describe("creating note sequences offline", () => {
  it("can create an empty sequence", () => {
    expect(noteDeltas([])).toEqual([]);
  });

  it("returns 0 for first note", () => {
    expect(noteDeltas([integer(5)])).toEqual([0]);

    expect(noteDeltas([integer(7)])).toEqual([0]);
  });

  test("for second note, returns relative semitone distance to first note", () => {
    expect(noteDeltas([integer(3), integer(5)])).toEqual([0, 2]);

    expect(noteDeltas([integer(7), integer(3)])).toEqual([0, -4]);
  });
});
