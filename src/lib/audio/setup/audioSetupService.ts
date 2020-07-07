import {
  createMachine,
  interpret,
  assign,
  DoneInvokeEvent,
  sendParent,
} from "xstate";
import { fromEventPattern } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { getWebAudioMediaStream, connectAnalyzer } from "./audioSetupEffects";
import { AudioRecorderNode } from "../recorder/webaudio/AudioRecorderNode";
import { escalate } from "xstate/lib/actions";

type WebAudio = {
  media?: MediaStream;
  audio?: AudioContext;
};

export type AudioSetupContext = WebAudio & {
  node?: AudioRecorderNode;
  message?: string;
};

export type AudioSetupEvent = { type: "RETRY" } | { type: "CANCEL" };

export type AudioSetupState = {
  context: AudioSetupContext;
} & (
  | { value: "detectingAudio" }
  | { value: "noAudioFound" }
  | { value: "createAudioAnalyzer" }
  | { value: "analyzerCreated" }
  | { value: "analyzerError" }
  | { value: "cancelled" }
);

export const audioSetupMachine = createMachine<
  AudioSetupContext,
  AudioSetupEvent,
  AudioSetupState
>(
  {
    id: "WebAudioSetup",
    initial: "detectingAudio",
    context: {},
    states: {
      detectingAudio: {
        invoke: {
          src: "initBrowserAudio",
          onDone: {
            target: "createAudioAnalyzer",
            actions: assign((_context, event) => event.data),
          },
          onError: {
            target: "noAudioFound",
            actions: assign((_context, event) => ({ message: event.data })),
          },
        },
        on: {
          CANCEL: "cancelled",
        },
      },

      cancelled: {
        // type: "final",
        entry: escalate("No audio recording device was found"),
      },

      noAudioFound: {
        on: {
          RETRY: "detectingAudio",
          CANCEL: "cancelled",
        },
        // type: "final",
        // entry: escalate("No audio recording device was found"),
      },

      createAudioAnalyzer: {
        invoke: {
          src: "createAnalyzer",
          onDone: {
            target: "analyzerCreated",
            actions: assign((context, event) => ({
              ...context,
              node: event.data,
            })),
          },
          onError: {
            target: "analyzerError",
            actions: assign<AudioSetupContext, DoneInvokeEvent<string>>({
              media: (context) => context.media,
              audio: (context) => context.audio,
              node: undefined,
              message: (_, e) => e.data,
            }),
          },
        },
      },

      analyzerCreated: {
        type: "final",
        data: (context) => {
          return {
            audio: context.audio,
            node: context.node,
          };
        },
      },

      analyzerError: {
        type: "final",
        data: (context) => {
          return {
            message: context.message,
          };
        },
        // on: { DETECT: "createAudioAnalyzer" },
      },
    },
  },
  {
    services: {
      initBrowserAudio: async () => {
        const media = await getWebAudioMediaStream();

        const audio = new globalThis.AudioContext();

        return {
          media,
          audio,
        };
      },
      createAnalyzer: async (context) => {
        const node = await AudioRecorderNode.create(context.audio!);

        connectAnalyzer(context.audio!, node, context.media!);

        return node;
      },
    },
  }
);

// Machine instance with internal state
export const makeAudioSetupService = () =>
  interpret(audioSetupMachine)
    .onTransition((state) => console.log(state.value, state.context))
    .start();

export type AudioSetupService = ReturnType<typeof makeAudioSetupService>;

// State machine services don't give you states, but an observable of [state, event],
// if you want to have the state only use fromEventPattern.
export const audioSetup$ = (
  service: ReturnType<typeof makeAudioSetupService>
) =>
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
