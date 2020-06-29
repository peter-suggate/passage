// import {
//   createMachine,
//   interpret,
//   assign,
//   send,
//   DoneInvokeEvent,
// } from "xstate";
// import { fromEventPattern } from "rxjs";
// import { shareReplay } from "rxjs/operators";
// import { ANIM_CONSTANTS } from "@/transitions/constants";

// type Context = {
// };

// type Event = { type: "BEGIN_PRACTICE" } | { type: "FINISHED" };

// export type AppValidStates =
//   | "home"
//   | ""
//   | "running"
//   | "resuming"
//   | "error"
//   | "suspended";

// export type AppState = { context: Context } & { value: AppValidStates };

// export const audioMachine = createMachine<Context, Event, AppState>(
//   {
//     id: "Audio",
//     initial: "uninitialized",
//     context: {
//       audio: undefined,
//       analyzer$: undefined,
//       message: undefined,
//     },
//     states: {
//       uninitialized: {
//         on: {
//           BEGIN_PRACTICE: "setupStart",
//           // START: "transitionUninitializedToSetup",
//         },
//       },

//       // transitionUninitializedToSetup: {
//       //   after: {
//       //     TRANSITION_DELAY: "setupStart",
//       //   },
//       // },

//       // Perform audio setup using the audioSetup child service.
//       setupStart: {
//         invoke: {
//           id: "audio-setup",
//           src: "audioSetup",
//           onDone: {
//             target: "resuming",
//             actions: assign<Context, DoneInvokeEvent<AudioSetupContext>>(
//               (_, e) => ({
//                 audio: e.data.audio,
//                 analyzer$: e.data.node,
//               })
//             ),
//           },
//         },
//       },

//       resuming: {
//         invoke: {
//           src: "resume",
//           onDone: {
//             target: "running",
//           },
//           onError: {
//             target: "error",
//             actions: assign<Context, any>({
//               message: (_, e) => e.data,
//             }),
//           },
//         },
//       },

//       // Once audio recording is running,
//       running: {
//         invoke: {
//           id: "running",
//           src: "analyzer",
//           data: (ctx: Context) =>
//             ({
//               analyzerEvents$: ctx.analyzer$,
//               note: undefined,
//               // (context, event) => context.setup
//             } as ActiveNoteContext),
//         },
//         on: {
//           STOP: "suspending",
//           // STOP: "transitionRunningToSuspended",
//         },
//       },

//       // transitionRunningToSuspended: {
//       //   after: {
//       //     TRANSITION_DELAY: "suspending",
//       //   },
//       // },

//       suspending: {
//         invoke: {
//           src: "suspend",
//           onDone: {
//             target: "suspended",
//           },
//           onError: {
//             target: "error",
//             actions: assign<Context, any>({
//               message: (_, e) => e.data,
//             }),
//           },
//         },
//       },

//       error: {
//         // on: {},
//       },

//       suspended: {
//         on: { START: "resuming" },
//         // on: { START: "transitionUninitializedToSetup" },
//       },
//     },
//   },
//   {
//     delays: {
//       TRANSITION_DELAY: ANIM_CONSTANTS.routerTransitionMs,
//     },
//     services: {
//       audioSetup: (context, event) => audioSetupMachine,
//       resume: (context) => resumeAudio(context.audio!),
//       suspend: (context) => suspendAudio(context.audio!),
//       analyzer: (context) => activeNoteMachine,
//     },
//   }
// );

// // Machine instance with internal state
// export const makeAudioService = () =>
//   interpret(audioMachine)
//     // .onTransition((state) => console.log(state.value, state.context))
//     .start();

// export type AudioService = ReturnType<typeof makeAudioService>;

// // State machine services don't give you states, but an observable of [state, event],
// // if you want to have the state only use fromEventPattern.
// export const makeAudio$ = (service: AudioService) =>
//   fromEventPattern<AudioState>(
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
