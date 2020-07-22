import { createMachine, interpret } from "xstate";
import {
  PiecePracticeObservables,
  piecePracticeObservables,
} from "./piecePracticeObservables";
import { ListenObservables } from "../listen/listenObservables";
import {
  PracticePiece,
  initPracticePiece,
} from "@/lib/audio/analysis/practice-pieces";
import { Piece } from "@/lib/music-recognition";

export const initPiecePracticeContext = (
  piece: Piece,
  listenObservables: ListenObservables
): PiecePracticeContext => ({
  piece: initPracticePiece(piece),
  observables: piecePracticeObservables(listenObservables),
});

export type PiecePracticeContext = {
  piece: PracticePiece;
  observables: PiecePracticeObservables;
};

type Event =
  | { type: "PLAYER_STOPPED" }
  | { type: "NOTE_PLAYED_AFTER_LONG_PAUSE" }
  | { type: "LAST_NOTE_PLAYED" };

type ValidPiecePracticeStates =
  | "initialPlaythrough"
  | "sectionPractice"
  | "waiting";

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
    initial: "initialPlaythrough",
    states: {
      initialPlaythrough: {
        on: {
          LAST_NOTE_PLAYED: {
            target: "waiting",
          },
          PLAYER_STOPPED: {
            target: "waiting",
          },
        },
      },

      sectionPractice: {
        on: {
          LAST_NOTE_PLAYED: {
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

// // Machine instance with internal state
// export const makePiecePracticeService = () =>
//   interpret(piecePracticeMachine)
//     .onTransition((state) => console.log(state.value, state.context))
//     .start();

// export type PiecePracticeService = ReturnType<typeof makePiecePracticeService>;
