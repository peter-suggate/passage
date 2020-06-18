import { createMachine, interpret, assign, DoneInvokeEvent } from "xstate";
import { fromEventPattern } from "rxjs";
import { shareReplay, map } from "rxjs/operators";
import { AudioAnalyzerNode } from "../recorder/webaudio/AudioRecorderNode";
import { AudioOnsetEvent, AudioPitchEvent } from "../audio-types";
import { frequencyToNote, Note } from "./activeNote";
import { Pitch } from "music-analyzer-wasm-rs";

export type ActiveNoteContext = {
  analyzerEvents$?: AudioAnalyzerNode;
  note?: Note;
};

type Event =
  | { type: "PITCH_ADDED"; pitch: Pitch }
  | { type: "ONSET_ADDED"; t: number };

export type ActiveNoteState = { context: ActiveNoteContext } & (
  | { value: "uninitialized" }
  | { value: "waiting" }
  | { value: "noteActive" }
  | { value: "finished" }
);

export const activeNoteMachine = createMachine<
  ActiveNoteContext,
  Event,
  ActiveNoteState
>({
  id: "ActiveNote",
  initial: "uninitialized",
  context: {} as ActiveNoteContext,
  states: {
    uninitialized: {
      invoke: {
        src: (context) =>
          context.analyzerEvents$!.pipe(
            map((e) =>
              e.type === "pitch"
                ? { type: "PITCH_ADDED", pitch: e.pitch }
                : { type: "ONSET_ADDED", t: e.t }
            )
          ),
        // interval(context.myInterval).pipe(
        //   map(value => ({ type: 'COUNT', value })),
        //   take(5)
        // ),
        onDone: {
          target: "finished",
          actions: assign<ActiveNoteContext, DoneInvokeEvent<Pitch>>({
            note: (context, event) => frequencyToNote(event.data.frequency),
          }),
        },
      },
    },

    waiting: {
      on: {
        PITCH_ADDED: "noteActive",
        // ONSET_ADDED: ""
      },
    },

    noteActive: {
      on: { PITCH_ADDED: "noteActive" },
    },

    finished: {
      type: "final",
    },
  },
});

// // Machine instance with internal state
// export const activeNoteService = () =>
//   interpret(activeNoteMachine)
//     // .onTransition((state) => console.log(state.value, state.context))
//     .start();

// // State machine services don't give you states, but an observable of [state, event],
// // if you want to have the state only use fromEventPattern.
// export const audioSetup$ = (service: ReturnType<typeof activeNoteService>) =>
//   fromEventPattern<ActiveNoteState>(
//     (handler) => {
//       service
//         // Listen for state transitions
//         .onTransition((state, _) => handler(state))
//         // Start the service
//         .start();
//       return service;
//     },
//     (_, service) => service.stop()
//   ).pipe(shareReplay(1));
