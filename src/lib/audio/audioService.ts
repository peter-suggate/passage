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
import { setupSynthesizerMachine } from "./synth";
import { resumeAudio, suspendAudio } from "./setup/audioSetupEffects";
import { AudioRecorderNode } from "./recorder/webaudio/AudioRecorderNode";
import { AudioSynthNode } from "./recorder/synthaudio/AudioSynthNode";
import { ANIM_CONSTANTS } from "@/transitions/constants";
import { analyzerMachine } from "./analysis/analyzerService";
import { SynthesizerConfig } from "./synth/synth-types";

type Context = {
  audio?: AudioContext;
  analyzer$?: AudioRecorderNode | AudioSynthNode;
  message?: string;
  synthConfig?: SynthesizerConfig;
};

type Event =
  | { type: "START" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "USE_SYNTH" };

export type AudioValidStates =
  | "uninitialized"
  | "setupStart"
  | "setupSynthesizer"
  | "running"
  | "resuming"
  | "error"
  | "suspended";

export type AudioState = { context: Context } & { value: AudioValidStates };

export const audioMachine = createMachine<Context, Event, AudioState>(
  {
    id: "Audio",
    initial: "uninitialized",
    context: {
      audio: undefined,
      analyzer$: undefined,
      message: undefined,
    },
    states: {
      uninitialized: {
        on: {
          START: "setupStart",
        },
      },

      // Perform audio setup using the audioSetup child service.
      setupStart: {
        invoke: {
          id: "audio-setup",
          src: "audioSetup",
          onDone: {
            target: "suspended",
            actions: assign<Context, DoneInvokeEvent<AudioSetupContext>>(
              (_, e) => ({
                message: e.data.message,
                audio: e.data.audio,
                analyzer$: e.data.node,
              })
            ),
          },
          onError: {
            target: "error",
            actions: assign((_, e) => ({
              message: e.data,
            })),
          },
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

      // Once audio recording is running,
      running: {
        invoke: {
          id: "running",
          src: "analyzer",
          data: (context: Context) =>
            ({
              analyzerEvents$: context.analyzer$,
              note: undefined,
              // (context, event) => context.setup
            } as ActiveNoteContext),
        },
        on: {
          STOP: "suspending",
          // STOP: "transitionRunningToSuspended",
        },
      },

      // transitionRunningToSuspended: {
      //   after: {
      //     TRANSITION_DELAY: "suspending",
      //   },
      // },

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
        on: { USE_SYNTH: "setupSynthesizer" },
      },

      setupSynthesizer: {
        invoke: {
          src: "setupSynthesizer",
          onDone: {
            target: "running",
            actions: assign({
              synthConfig: (_, e) => e.data,
            }),
          },
          onError: {
            target: "error",
            actions: assign({
              message: (_, e) => e.data,
            }),
          },
        },
      },

      suspended: {
        on: { RESUME: "resuming" },
        // on: { START: "transitionUninitializedToSetup" },
      },
    },
  },
  {
    delays: {
      TRANSITION_DELAY: ANIM_CONSTANTS.routerTransitionMs,
    },
    services: {
      audioSetup: (context, event) => audioSetupMachine,
      resume: (context) => resumeAudio(context.audio!),
      suspend: (context) => suspendAudio(context.audio!),
      analyzer: (context) => analyzerMachine,
      setupSynthesizer: (context) => setupSynthesizerMachine,
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
