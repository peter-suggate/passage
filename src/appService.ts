import { createMachine, interpret, assign, DoneInvokeEvent } from "xstate";
import { fromEventPattern } from "rxjs";
import { shareReplay } from "rxjs/operators";
import {
  sessionMachine,
  initSessionContext,
} from "@/views/session/sessionService";
import { AudioRecorderNode } from "./lib/audio/recorder/webaudio/AudioRecorderNode";
import { AudioSynthesizer } from "./lib/audio/recorder/synthaudio/AudioSynthesizer";
import { SynthesizerConfig } from "./lib/audio/synth/synth-types";
import { AudioSetupContext, audioSetupMachine } from "./views/setup-audio";
import { resumeAudio, suspendAudio } from "./lib/audio/audioEffects";
import { setupSynthesizerMachine } from "./views/setup-synth";

export type AppServiceContext = {
  audio?: AudioContext;
  analyzer$?: AudioRecorderNode | AudioSynthesizer;
  message?: string;
  synthConfig?: SynthesizerConfig;
};

type Event =
  | { type: "START" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "USE_SYNTH" }
  | { type: "USE_AUDIO" };

export type AppValidStates =
  | "uninitialized"
  | "setupAudio"
  | "noWebAudio"
  | "setupSynthesizer"
  | "running"
  | "resuming"
  | "error"
  | "suspended";

export type AppState = { context: AppServiceContext } & {
  value: AppValidStates;
};

export const appMachine = createMachine<AppServiceContext, Event, AppState>(
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
          START: "setupAudio",
          USE_SYNTH: "setupSynthesizer",
        },
      },

      // Perform audio setup using the audioSetup child service.
      setupAudio: {
        invoke: {
          src: "audioSetup",
          onDone: {
            target: "suspended",
            actions: assign<
              AppServiceContext,
              DoneInvokeEvent<AudioSetupContext>
            >((_, e) => ({
              message: e.data.message,
              audio: e.data.audio,
              analyzer$: e.data.node,
            })),
          },
          onError: {
            target: "noWebAudio",
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
            actions: assign<AppServiceContext, any>({
              message: (_, e) => e.data,
            }),
          },
        },
      },

      // Once audio recording is running,
      running: {
        invoke: {
          id: "running",
          src: "listen",
          data: (context: AppServiceContext) =>
            initSessionContext(context.analyzer$!),
        },
        on: {
          STOP: "suspending",
          USE_AUDIO: "setupAudio",
          // STOP: "transitionRunningToSuspended",
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
            actions: assign<AppServiceContext, any>({
              message: (_, e) => e.data,
            }),
          },
        },
      },

      noWebAudio: {
        on: { USE_SYNTH: "setupSynthesizer" },
      },

      error: {},

      setupSynthesizer: {
        invoke: {
          src: "setupSynthesizer",
          onDone: {
            target: "resuming",
            actions: [
              assign({
                synthConfig: (_, e) => e.data.config,
                analyzer$: (_, e) => e.data.node,
              }),
            ],
          },
          onError: {
            target: "error",
            actions: [
              assign({
                message: (_, e) => e.data,
              }),
            ],
          },
        },
        on: { USE_AUDIO: "setupAudio" },
      },

      suspended: {
        on: { RESUME: "resuming", USE_AUDIO: "setupAudio" },
        // on: { START: "transitionUninitializedToSetup" },
      },
    },
  },
  {
    services: {
      audioSetup: (context, event) => audioSetupMachine,
      resume: (context) => resumeAudio(context.analyzer$!),
      suspend: (context) => suspendAudio(context.analyzer$!),
      listen: (context) => sessionMachine,
      setupSynthesizer: (context) => setupSynthesizerMachine,
    },
  }
);

// Machine instance with internal state
export const makeAppService = () =>
  interpret(appMachine)
    .onTransition((state) => console.log(state.value, state.context))
    .start();

export type AppService = ReturnType<typeof makeAppService>;

// State machine services don't give you states, but an observable of [state, event],
// if you want to have the state only use fromEventPattern.
export const makeApp$ = (service: AppService) =>
  fromEventPattern<AppState>(
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

export type App$ = ReturnType<typeof makeApp$>;
