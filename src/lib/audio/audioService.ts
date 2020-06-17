import {
  createMachine,
  interpret,
  assign,
  send,
  DoneInvokeEvent,
} from "xstate";
import { fromEventPattern } from "rxjs";
import { shareReplay } from "rxjs/operators";
import {
  AudioSetupService,
  audioSetupMachine,
  makeAudioSetupService,
} from "./setup";
import { activeNoteMachine } from "./analysis/activeNoteService";
import { resumeAudio, suspendAudio } from "./setup/audioSetupEffects";

type Context = {
  context?: AudioContext;
  message?: string;
};

type Event = { type: "START" } | { type: "STOP" };

export type AudioState = { context: Context } & (
  | { value: "uninitialized" }
  | { value: "inSetup" }
  | { value: "running" }
  | { value: "resume" }
);

export const audioMachine = createMachine<Context, Event, AudioState>(
  {
    id: "Audio",
    initial: "uninitialized",
    context: {
      setup: undefined,
    } as Context,
    states: {
      uninitialized: {
        on: {
          START: "inSetup",
        },
      },

      inSetup: {
        invoke: {
          id: "audio-setup",
          src: "audioSetup",
          onDone: {
            target: "running",
            actions: assign<Context, DoneInvokeEvent<AudioContext>>({
              context: (_, e) => {
                console.log(e);
                return e.data;
              },
            }),
          },
        },
      },

      running: {
        invoke: {
          id: "running",
          src: activeNoteMachine,
        },
        on: {
          STOP: "suspend",
        },
      },

      resume: {
        invoke: {
          id: "resume",
          src: (context) => resumeAudio(context.context!),
          onDone: {
            target: "analyzerRunning",
          },
          onError: {
            target: "analyzerError",
            actions: assign<Context, any>({
              message: (_, e) => e.data,
            }),
          },
        },
      },

      suspend: {
        invoke: {
          id: "suspend",
          src: (context) => suspendAudio(context.context!),
          onDone: {
            target: "analyzerSuspended",
          },
          onError: {
            target: "analyzerError",
            actions: assign<Context, any>({
              message: (_, e) => e.data,
            }),
          },
        },
      },

      // suspended: {
      //   invoke: {
      //     // id: "audio-setup",
      //     // src: "audioSetup",
      //     src: async (context: Context) => {
      //       context.setup && context.setup.
      //       // context.setup!.send("SUSPEND");
      //       // return context;
      //     },
      //     onDone: {
      //       target: "uninitialized",
      //     },
      //   },
      //   // entry: send("SUSPEND", { to: "audio-setup" }),
      //   on: { START: "running" },
      // },
    },
  },
  {
    services: {
      audioSetup: (context, event) => audioSetupMachine,
    },
  }
);

// Machine instance with internal state
export const makeAudioService = () =>
  interpret(audioMachine)
    .onTransition((state) => console.log(state.value, state.context))
    .start();

export type AudioService = ReturnType<typeof makeAudioService>;

// State machine services don't give you states, but an observable of [state, event],
// if you want to have the state only use fromEventPattern.
export const makeAudio$ = (service: AudioService) =>
  fromEventPattern<AudioState>(
    (handler) => {
      service
        // Listen for state transitions
        .onTransition((state, _) => handler(state))
        // Start the service
        .start();
      return service;
    },
    (_, service) => service.stop()
  ).pipe(shareReplay(1));
