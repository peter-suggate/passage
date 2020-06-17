import { createMachine, interpret, assign } from "xstate";
import { fromEventPattern } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { AudioAnalyzerNode } from "../recorder/webaudio/AudioRecorderNode";
import { AudioOnsetEvent, AudioPitchEvent } from "../audio-types";
import { Note } from "./activeNote";

type Context = {
  note: Note;
};

type Event =
  | { type: "PITCH_ADDED"; pitch: AudioPitchEvent }
  | { type: "ONSET_ADDED"; onset: AudioOnsetEvent };

export type ActiveNoteState = { context: Context } & (
  | { value: "none" }
  | { value: "noteActive" }
);

export const activeNoteMachine = createMachine<Context, Event, ActiveNoteState>(
  {
    id: "ActiveNote",
    initial: "none",
    context: {} as Context,
    states: {
      none: {
        on: {
          PITCH_ADDED: "noteActive",
          // ONSET_ADDED: ""
        },
      },

      noteActive: {
        // actions: assign({
        //   posts: (context, event) => event.data
        // }),
        on: { PITCH_ADDED: "noteActive" },
      },
    },
  }
);

// Machine instance with internal state
export const activeNoteService = () =>
  interpret(activeNoteMachine)
    // .onTransition((state) => console.log(state.value, state.context))
    .start();

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
