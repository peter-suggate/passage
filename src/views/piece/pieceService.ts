import { createMachine, interpret } from "xstate";
import { PieceObservables, pieceObservables } from "./pieceObservables";
import { SessionObservables } from "../session/sessionObservables";
import { RecordedPiece } from "@/lib/passage-analysis";

export const initPieceContext = (
  piece: RecordedPiece,
  sessionObservables: SessionObservables
): PieceContext => ({
  piece,
  observables: pieceObservables(sessionObservables),
});

export type PieceContext = {
  piece: RecordedPiece;
  observables: PieceObservables;
};

type Event =
  | { type: "PLAYER_STOPPED" }
  | { type: "NOTE_PLAYED_AFTER_LONG_PAUSE" }
  | { type: "LAST_PIECE_NOTE_PLAYED" };

type ValidPieceStates = "sectionPractice" | "waiting";

export type PieceState = {
  context: PieceContext;
} & { value: ValidPieceStates };

export const piecePracticeMachine = createMachine<
  PieceContext,
  Event,
  PieceState
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
export const makePieceService = () =>
  interpret(piecePracticeMachine)
    .onTransition((state) => console.log(state.value, state.context))
    .start();

export type PieceService = ReturnType<typeof makePieceService>;
