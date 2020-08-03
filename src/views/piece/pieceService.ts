import { createMachine, interpret } from "xstate";
import { PiecePracticeObservables, pieceObservables } from "./pieceObservables";
import { SessionObservables } from "../session/sessionObservables";
import { MatchedPiece } from "@/lib/music-recognition";
import {
  initRecordedPiece,
  RecordedSession,
  RecordedPiece,
} from "@/lib/passage-analysis";
import { AnalyzedNote } from "@/lib/audio/analysis";

export const initPieceContext = (
  session: RecordedSession,
  match: MatchedPiece,
  notes: AnalyzedNote[],
  sessionObservables: SessionObservables
): PiecePracticeContext => ({
  piece: initRecordedPiece(session, match, notes),
  observables: pieceObservables(sessionObservables),
});

export type PiecePracticeContext = {
  piece: RecordedPiece;
  observables: PiecePracticeObservables;
};

type Event =
  | { type: "PLAYER_STOPPED" }
  | { type: "NOTE_PLAYED_AFTER_LONG_PAUSE" }
  | { type: "LAST_PIECE_NOTE_PLAYED" };

type ValidPiecePracticeStates = "sectionPractice" | "waiting";

export type PiecePracticeState = {
  context: PiecePracticeContext;
} & { value: ValidPiecePracticeStates };

export const piecePracticeMachine = createMachine<
  PiecePracticeContext,
  Event,
  PiecePracticeState
>(
  {
    id: "PiecePractice",
    initial: "sectionPractice",
    states: {
      sectionPractice: {
        // invoke: {
        //   src: (context) => context.observables.
        // },
        on: {
          LAST_PIECE_NOTE_PLAYED: {
            target: "waiting",
          },
          PLAYER_STOPPED: {
            target: "waiting",
          },
        },
      },

      waiting: {
        on: {
          NOTE_PLAYED_AFTER_LONG_PAUSE: {
            target: "sectionPractice",
          },
        },
      },

      finished: {
        type: "final",
      },
    },
  },
  {
    services: {},
    actions: {},
  }
);

// Machine instance with internal state
export const makePiecePracticeService = () =>
  interpret(piecePracticeMachine)
    .onTransition((state) => console.log(state.value, state.context))
    .start();

export type PieceService = ReturnType<typeof makePiecePracticeService>;
