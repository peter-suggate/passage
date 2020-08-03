import { SessionContext, sessionMachine } from "../sessionService";
import { Observable, of } from "rxjs";
import { partialImpl } from "@/lib/testing/partial-impl";
import { SessionObservables } from "../sessionObservables";
import { MatchedPiece, TWINKLE, piece } from "@/lib/music-recognition";
import { interpret } from "xstate";
import { initRecordingSession } from "@/lib/passage-analysis";
import { AnalyzedNote, makeNote } from "@/lib/audio/analysis";
import { matchedPiece$ } from "@/lib/music-recognition/observables";

export const initTestSessionContext = (
  recentDistinctNotes$: Observable<AnalyzedNote[]>
  // matchedPiece$: Observable<MatchedPiece>
): SessionContext =>
  partialImpl<SessionContext>({
    session: initRecordingSession(),
    observables: partialImpl<SessionObservables>({
      recentDistinctNotes$,
      matchedPiece$: matchedPiece$()(recentDistinctNotes$),
    }),
  });

function testMachine(
  recentDistinctNotes$: Observable<AnalyzedNote[]>,
  optionsIn?: typeof sessionMachine.options.services
) {
  const options = {
    ...optionsIn,
  };

  const service = sessionMachine
    .withConfig({
      services: options,
    })
    .withContext(initTestSessionContext(recentDistinctNotes$));

  return service;
}

it("begins at detecting the piece being practiced", () => {
  const service = testMachine(of());

  expect(service.initialState.value).toBe("detecting");
});

describe("when piece is matched", () => {
  it("transitions to practice piece state", async () => {
    const input$ = of(TWINKLE.noteNames.map((n) => makeNote(n)));

    const service = interpret(testMachine(input$)).start();

    await input$.toPromise();

    expect(service.state.value).toBe("piece");
  });

  it("adds the piece to the list of pieces practiced in the session", async () => {
    const input$ = of(TWINKLE.noteNames.map((n) => makeNote(n)));

    const service = interpret(testMachine(input$)).start();

    await input$.toPromise();

    expect(service.state.context.session.pieces.length).toBe(1);
  });
});
