import { createMachine, interpret, assign } from "xstate";
import { fromEventPattern } from "rxjs";
import { shareReplay } from "rxjs/operators";
import {
  getWebAudioMediaStream,
  connectAnalyzer,
  resumeAudio,
  suspendAudio,
} from "./audioSetupEffects";
import { AudioAnalyzerNode } from "../recorder/webaudio/AudioRecorderNode";

type Context = {
  media?: MediaStream;
  context?: AudioContext;
  node?: AudioAnalyzerNode;
  message?: string;
};

type Event =
  | { type: "DETECT" }
  | { type: "SUSPEND" }
  | { type: "RESUME" }
  | { type: "CANCEL" };

export type AudioSetupState = { context: Context } & (
  | { value: "uninitialized" }
  | { value: "detectingAudio" }
  | { value: "audioFound" }
  | { value: "noAudioFound" }
  | { value: "createAudioAnalyzer" }
  | { value: "resume" }
  | { value: "analyzerSuspended" }
  | { value: "analyzerRunning" }
  | { value: "analyzerError" }
);

export const audioSetupMachine = createMachine<Context, Event, AudioSetupState>(
  {
    id: "WebAudioSetup",
    initial: "uninitialized",
    context: {
      media: undefined,
      context: undefined,
    } as Context,
    states: {
      uninitialized: {
        on: {
          DETECT: "detectingAudio",
        },
      },

      detectingAudio: {
        invoke: {
          id: "detectWebAudio",
          src: () => getWebAudioMediaStream(),
          onDone: {
            target: "createAudioAnalyzer",
            actions: assign<Context, any>({
              media: (_, e) => e.data,
              context: new globalThis.AudioContext(),
              message: undefined,
            }),
          },
          onError: {
            target: "noAudioFound",
            actions: assign<Context, any>({
              media: undefined,
              context: undefined,
              message: (_, e) => e.data,
            }),
          },
        },
        on: {
          CANCEL: "uninitialized",
        },
      },

      noAudioFound: { on: { DETECT: "detectingAudio" } },

      createAudioAnalyzer: {
        invoke: {
          id: "createAudioAnalyzer",
          src: (context) =>
            AudioAnalyzerNode.create(context.context!).then((node) =>
              connectAnalyzer(context.context!, node, context.media!)
            ),
          onDone: {
            target: "resume",
            actions: assign<Context, any>({
              media: (context) => context.media,
              context: (context) => context.context,
              node: (_, e) => e.data,
            }),
          },
          onError: {
            target: "analyzerError",
            actions: assign<Context, any>({
              media: (context) => context.media,
              context: (context) => context.context,
              node: undefined,
              message: (_, e) => e.data,
            }),
          },
        },
      },

      analyzerSuspended: {
        on: {
          RESUME: "resume",
        },
      },

      analyzerRunning: {
        on: {
          SUSPEND: "suspend",
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

      analyzerError: {
        on: { DETECT: "createAudioAnalyzer" },
      },
    },
  }
);

// Machine instance with internal state
export const audioSetupService = () =>
  interpret(audioSetupMachine)
    // .onTransition((state) => console.log(state.value, state.context))
    .start();

// State machine services don't give you states, but an observable of [state, event],
// if you want to have the state only use fromEventPattern.
export const audioSetup$ = (service: ReturnType<typeof audioSetupService>) =>
  fromEventPattern<AudioSetupState>(
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
