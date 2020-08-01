import { createMachine, interpret, assign, DoneInvokeEvent } from "xstate";
import { escalate } from "xstate/lib/actions";
import {
  getWebAudioMediaStream,
  connectAnalyzer,
} from "@/lib/audio/setup/audioSetupEffects";
import { AudioRecorderNode } from "@/lib/audio/recorder/webaudio/AudioRecorderNode";

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
            actions: assign((_context, event) => ({
              message: event.data.message,
            })),
          },
        },
        on: {
          CANCEL: "cancelled",
        },
      },

      cancelled: {
        entry: escalate("No audio recording device was found"),
      },

      noAudioFound: {
        entry: escalate(
          (context) => context.message || "No audio recording device was found"
        ),
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
