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

type Event =
  // | { type: "DETECT" }
  { type: "SUSPEND" } | { type: "RESUME" } | { type: "CANCEL" };

export type AudioSetupState = {
  context: AudioSetupContext;
} & ( // | { value: "uninitialized" }
  | { value: "detectingAudio" }
  | { value: "audioFound" }
  | { value: "noAudioFound" }
  | { value: "createAudioAnalyzer" }
  | { value: "analyzerSuspended" }
  | { value: "analyzerError" }
);

export const audioSetupMachine = createMachine<
  AudioSetupContext,
  Event,
  AudioSetupState
>(
  {
    id: "WebAudioSetup",
    initial: "detectingAudio",
    context: {},
    states: {
      // uninitialized: {
      //   on: {
      //     DETECT: "detectingAudio",
      //   },
      // },

      detectingAudio: {
        invoke: {
          src: "detectWebAudio",
          // onEntry: [sendParent("SETUP.DETECTING_AUDIO")],
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
          CANCEL: "noAudioFound",
        },
      },

      noAudioFound: {
        entry: escalate("No audio recording device was found"),
      },

      createAudioAnalyzer: {
        invoke: {
          src: "createAnalyzer",
          onDone: {
            target: "analyzerSuspended",
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

      analyzerSuspended: {
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
        // on: { DETECT: "createAudioAnalyzer" },
      },
    },
  },
  {
    services: {
      detectWebAudio: async () => {
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
