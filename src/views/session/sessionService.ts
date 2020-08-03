import { createMachine, interpret, assign, EventObject } from "xstate";
import { Observable, combineLatest } from "rxjs";
import { AudioRecorderEventTypes } from "@/lib/audio/recorder";
import { sessionObservables, SessionObservables } from "./sessionObservables";
import { initPieceContext, piecePracticeMachine } from "../piece/pieceService";
import { MatchedPiece } from "@/lib/music-recognition";
import { nearestNotes$, AnalyzedNote } from "@/lib/audio/analysis";
import { map } from "rxjs/operators";
import { RecordedSession, addPieceToSession } from "@/lib/passage-analysis";
import { initRecordingSession } from "@/lib/passage-analysis";

export type SessionContext = {
  observables: SessionObservables;
  session: RecordedSession;
};

export const initSessionContext = (
  recorderEvents$: Observable<AudioRecorderEventTypes>
): SessionContext => ({
  observables: sessionObservables(nearestNotes$(recorderEvents$!)),
  session: initRecordingSession(),
});

type DetectedEvent = {
  type: "PIECE_DETECTED";
  match: MatchedPiece;
  notes: AnalyzedNote[];
};

type Event = DetectedEvent;

const unwrapEvent = <T extends { type: K | string }, K extends string = string>(
  event: EventObject,
  expectedType: K
): T => {
  if (event.type !== expectedType)
    throw Error(
      `State machine expected an event of type: ${expectedType}, instead got: ${event.type}`
    );

  return event as T;
};

type ValidListenStates = "detecting" | "piece" | "finished";

export type ListenState = {
  context: SessionContext;
} & { value: ValidListenStates };

/**
 * Active when app is listening to user and in the process of identifying what they're practicing.
 */
export const sessionMachine = createMachine<SessionContext, Event, ListenState>(
  {
    id: "Listen",
    initial: "detecting",
    states: {
      // In the process of detecting what the user's playing.
      detecting: {
        invoke: {
          src: "detectPiece$",
          onDone: "finished",
        },
        on: {
          PIECE_DETECTED: {
            target: "piece",
            actions: ["addPiece"],
          },
        },
      },

      // A matching piece has been found, invoke the child machine responsible for giving the user feedback.
      piece: {
        invoke: {
          src: "practicePiece",
          data: (context: SessionContext, event) =>
            initPieceContext(
              context.session,
              event.match,
              event.notes,
              context.observables
            ),
          onDone: {
            target: "detecting",
          },
        },
      },

      // Session ended.
      finished: {
        type: "final",
      },
    },
  },
  {
    services: {
      practicePiece: piecePracticeMachine,
      detectPiece$: (context) =>
        // Once the closest matching piece becomes concrete,
        combineLatest(
          context.observables.recentDistinctNotes$,
          context.observables.matchedPiece$
        ).pipe(
          map(
            ([notes, match]) =>
              ({
                type: "PIECE_DETECTED",
                match,
                notes,
              } as Event)
          )
        ),
    },
    actions: {
      addPiece: assign<SessionContext, Event>({
        session: (context, event) => {
          const { match, notes } = unwrapEvent<Event>(event, "PIECE_DETECTED");
          return addPieceToSession(context.session, match, notes);
        },
      }),
    },
  }
);

// Machine instance with internal state
export const makeListenService = () =>
  interpret(sessionMachine)
    .onTransition((state) => console.log(state.value, state.context))
    .start();

export type SessionService = ReturnType<typeof makeListenService>;
