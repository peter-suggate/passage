import { createMachine, interpret, assign, DoneInvokeEvent } from "xstate";
import { fromEventPattern } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { getWebAudioMediaStream, connectAnalyzer } from "./audioSetupEffects";
import { AudioAnalyzerNode } from "../recorder/webaudio/AudioRecorderNode";

export type AudioSetupContext = {
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

export type AudioSetupState = { context: AudioSetupContext } & (
  | { value: "uninitialized" }
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
>({
  id: "WebAudioSetup",
  initial: "detectingAudio",
  context: {
    media: undefined,
    context: undefined,
  } as AudioSetupContext,
  states: {
    uninitialized: {
      on: {
        DETECT: "detectingAudio",
      },
    },

    detectingAudio: {
      invoke: {
        id: "detectWebAudio",
        src: async () => {
          const media = await getWebAudioMediaStream();
          return {
            media,
            context: new globalThis.AudioContext(),
          };
        },
        onDone: {
          target: "createAudioAnalyzer",
          actions: assign<
            AudioSetupContext,
            DoneInvokeEvent<AudioSetupContext>
          >({
            media: (_, e) => e.data.media,
            context: (_, e) => e.data.context,
            message: undefined,
          }),
        },
        onError: {
          target: "noAudioFound",
          actions: assign<AudioSetupContext, DoneInvokeEvent<string>>({
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
        src: async (context) => {
          const node = await AudioAnalyzerNode.create(context.context!);

          connectAnalyzer(context.context!, node, context.media!);

          return node;
        },
        onDone: {
          target: "analyzerSuspended",
          actions: assign<
            AudioSetupContext,
            DoneInvokeEvent<AudioAnalyzerNode>
          >({
            media: (context) => context.media,
            context: (context) => context.context,
            node: (_, e) => e.data,
          }),
        },
        onError: {
          target: "analyzerError",
          actions: assign<AudioSetupContext, DoneInvokeEvent<string>>({
            media: (context) => context.media,
            context: (context) => context.context,
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
          context: context.context,
          node: context.node,
        };
      },
    },

    analyzerError: {
      on: { DETECT: "createAudioAnalyzer" },
    },
  },
});

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