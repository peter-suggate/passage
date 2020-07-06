import { createMachine, assign } from "xstate";
import { escalate } from "xstate/lib/actions";
import { SynthesizerConfig, defaultSynthConfig } from "./synth-types";
import { AudioSynthesizer } from "../recorder/synthaudio/AudioSynthesizer";

export type SynthSetupContext = {
  config: SynthesizerConfig;
  node?: AudioSynthesizer;
  message?: string;
};

type Event =
  | { type: "UPDATE_CONFIG"; config: Partial<SynthesizerConfig> }
  | { type: "FINISH" }
  | { type: "CANCEL" };

export type SynthSetupState = {
  context: SynthSetupContext;
} & (
  | { value: "configure" }
  | { value: "startGenerator" }
  | { value: "success" }
  | { value: "error" }
  | { value: "cancelled" }
);

export const setupSynthesizerMachine = createMachine<
  SynthSetupContext,
  Event,
  SynthSetupState
>(
  {
    id: "SynthSetup",
    initial: "configure",
    context: { config: defaultSynthConfig(), node: undefined },
    states: {
      configure: {
        on: {
          UPDATE_CONFIG: {
            actions: assign({
              config: (context, e) => ({ ...context.config, ...e.config }),
            }),
          },
          FINISH: "startGenerator",
          CANCEL: "cancelled",
        },
      },

      startGenerator: {
        invoke: {
          src: "createSynthAudio",
          onDone: {
            target: "success",
            actions: [
              assign({
                // config: (context, e) => context.config,
                node: (_, e) => e.data,
              }),
            ],
          },
          onError: {
            target: "error",
            actions: assign({
              message: (_, e) => e.data.message,
            }),
          },
        },
      },

      success: {
        type: "final",
        data: (context) => {
          return {
            config: context.config,
            node: context.node,
          };
        },
      },

      error: {
        type: "final",
        entry: (context) =>
          escalate(
            context.message
              ? `Setup synthesizer failed with error: ${context.message}`
              : "Synth setup failed"
          ),
      },

      cancelled: {
        entry: escalate("Synth setup cancelled"),
        type: "final",
      },
    },
  },
  {
    services: {
      createSynthAudio: (context) => AudioSynthesizer.create(context.config),
    },
  }
);
