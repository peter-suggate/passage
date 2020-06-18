import {
  createMachine,
  interpret,
  assign,
  send,
  DoneInvokeEvent,
} from "xstate";
import { fromEventPattern } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { audioSetupMachine, AudioSetupContext } from "./setup";
import {
  activeNoteMachine,
  ActiveNoteContext,
} from "./analysis/activeNoteService";
import { resumeAudio, suspendAudio } from "./setup/audioSetupEffects";
import { AudioAnalyzerNode } from "./recorder/webaudio/AudioRecorderNode";

type Context = {
  context?: AudioContext;
  node?: AudioAnalyzerNode;
  message?: string;
};

type Event = { type: "START" } | { type: "STOP" };

export type AudioState = { context: Context } & (
  | { value: "uninitialized" }
  | { value: "inSetup" }
  | { value: "running" }
  | { value: "resume" }
  | { value: "error" }
  | { value: "suspended" }
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

      // Perform audio setup using the audioSetup child service.
      inSetup: {
        invoke: {
          id: "audio-setup",
          src: "audioSetup",
          onDone: {
            target: "running",
            actions: assign<Context, DoneInvokeEvent<AudioSetupContext>>(
              (_, e) => ({
                context: e.data.context,
                node: e.data.node,
              })
            ),
          },
        },
      },

      // Once audio recording is running,
      running: {
        invoke: {
          id: "running",
          src: "analyzer",
          data: (ctx: Context) =>
            ({
              analyzerEvents$: ctx.node,
              note: undefined,
              // (context, event) => context.setup
            } as ActiveNoteContext),
        },
        on: {
          STOP: "suspending",
        },
      },

      resuming: {
        invoke: {
          src: "resume",
          onDone: {
            target: "running",
          },
          onError: {
            target: "error",
            actions: assign<Context, any>({
              message: (_, e) => e.data,
            }),
          },
        },
      },

      suspending: {
        invoke: {
          src: "suspend",
          onDone: {
            target: "suspended",
          },
          onError: {
            target: "error",
            actions: assign<Context, any>({
              message: (_, e) => e.data,
            }),
          },
        },
      },

      error: {
        // on: {},
      },

      suspended: {
        on: { START: "resuming" },
      },
    },
  },
  {
    services: {
      audioSetup: (context, event) => audioSetupMachine,
      resume: (context) => resumeAudio(context.context!),
      suspend: (context) => suspendAudio(context.context!),
      analyzer: (context) => activeNoteMachine,
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
