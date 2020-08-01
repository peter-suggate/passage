import { createMachine, interpret } from "xstate";
import { Observable } from "rxjs";
import { AudioRecorderEventTypes } from "@/lib/audio/recorder";
import { listenObservables, ListenObservables } from "./listenObservables";
import {
  initPiecePracticeContext,
  piecePracticeMachine,
} from "../piece-practice/piecePracticeService";
import {
  PracticePieces,
  initPracticePieces,
} from "@/lib/passage-analysis/practice-pieces";
import { Piece } from "@/lib/music-recognition";
import { nearestNotes$ } from "@/lib/audio/analysis";
import { map } from "rxjs/operators";

export type ListenContext = {
  observables: ListenObservables;
  pieces: PracticePieces;
};

export const initListenContext = (
  recorderEvents$: Observable<AudioRecorderEventTypes>
): ListenContext => ({
  observables: listenObservables(nearestNotes$(recorderEvents$!)),
  pieces: initPracticePieces(),
});

type Event = { type: "PIECE_DETECTED"; piece: Piece };

type ValidListenStates = "detecting" | "piece" | "finished";

export type ListenState = {
  context: ListenContext;
} & { value: ValidListenStates };

export const listenMachine = createMachine<ListenContext, Event, ListenState>(
  {
    id: "Listen",
    initial: "detecting",
    states: {
      detecting: {
        invoke: {
          src: (context) =>
            context.observables.matchedPiece$.pipe(
              map((piece) => ({
                type: "PIECE_DETECTED",
                piece,
              }))
            ),
          onDone: "finished",
        },
        on: {
          PIECE_DETECTED: {
            target: "piece",
          },
        },
      },

      piece: {
        invoke: {
          src: "practicePiece",
          data: (context: ListenContext, event) =>
            initPiecePracticeContext(event.piece, context.observables),
          onDone: {
            target: "detecting",
          },
        },
      },

      finished: {
        type: "final",
      },
    },
  },
  {
    services: {
      practicePiece: piecePracticeMachine,
    },
  }
);

// Machine instance with internal state
export const makeListenService = () =>
  interpret(listenMachine)
    .onTransition((state) => console.log(state.value, state.context))
    .start();

export type ListenService = ReturnType<typeof makeListenService>;