import {
  initListenContext,
  ListenContext,
  listenMachine,
} from "../listenService";
import { AnalyzedNote } from "@/lib/audio/analysis";
import { Observable, of } from "rxjs";
import { partialImpl } from "@/lib/testing/partial-impl";
import { ListenObservables } from "../listenObservables";
import { MatchedPiece } from "@/lib/music-recognition";
import { interpret } from "xstate";

export const initTestListenContext = (
  matchedPiece$: Observable<MatchedPiece>
): ListenContext =>
  partialImpl<ListenContext>({
    pieces: [],
    observables: partialImpl<ListenObservables>({
      matchedPiece$,
    }),
  });

function testMachine(
  matchedPiece$: Observable<MatchedPiece>,
  optionsIn?: typeof listenMachine.options.services
) {
  const options = {
    ...optionsIn,
  };

  const service = listenMachine
    .withConfig({
      services: options,
    })
    .withContext(initTestListenContext(matchedPiece$));

  return service;
}

it("begins at detecting the piece being practiced", () => {
  const service = testMachine(
    of({ distance: 0, name: "Twinkle" } as MatchedPiece)
  );

  expect(service.initialState.value).toBe("detecting");
});

describe("when piece is matched", () => {
  it("transitions to practicePiece", async () => {
    const matchedPiece$ = of({ distance: 0, name: "Twinkle" } as MatchedPiece);

    const service = interpret(testMachine(matchedPiece$)).start();

    await matchedPiece$.toPromise();

    expect(service.state.value).toBe("piece");
  });
});
