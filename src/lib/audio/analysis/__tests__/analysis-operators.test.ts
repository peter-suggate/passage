import { expectEvents$ } from "@/lib/testing/rx-testing";
import { of } from "rxjs";
import { bufferUntilChanged, filterTransitions } from "../analysis-operators";

describe("filterInBetween", () => {
  it("works on empty sources", async (done) => {
    expectEvents$(of().pipe(filterTransitions()), [], done);
  });

  it("skips all isolated notes", async (done) => {
    expectEvents$(of(1, 2, 3, 4).pipe(filterTransitions()), [], done);
  });

  it("skips all pairs of notes", async (done) => {
    expectEvents$(of(1, 1, 2, 2).pipe(filterTransitions()), [], done);
  });

  it("emits all values once enough are present", async (done) => {
    expectEvents$(
      of("a", "a", "a").pipe(filterTransitions()),
      ["a", "a", "a"],
      done
    );
  });

  it("detects both triples", async (done) => {
    expectEvents$(
      of("a", "a", "a", "b", "b", "b").pipe(filterTransitions()),
      ["a", "a", "a", "b", "b", "b"],
      done
    );
  });

  it("skips the three values around each value change", async (done) => {
    expectEvents$(
      of(1, 1, 1, 2, 3, 3, 3).pipe(filterTransitions()),
      [1, 1, 1, 3, 3, 3],
      done
    );
  });
});

describe("bufferUntilChanged", () => {
  it("works on empty sources", async (done) => {
    expectEvents$(of().pipe(bufferUntilChanged()), [], done);
  });

  it("buffers values into distinct groups", async (done) => {
    expectEvents$(
      of(1, 2, 2, 3, 3, 3, 4).pipe(bufferUntilChanged()),
      [[1], [2], [2, 2], [3], [3, 3], [3, 3, 3], [4]],
      done
    );
  });
});
