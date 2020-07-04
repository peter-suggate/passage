import { createMachine, assign, DoneInvokeEvent } from "xstate";
import { escalate } from "xstate/lib/actions";
import { SynthesizerConfig, defaultSynthConfig } from "./synth-types";
import { AudioSynthNode } from "../recorder/synthaudio/AudioSynthNode";

export type SynthSetupContext = {
  config: SynthesizerConfig;
  node?: AudioSynthNode;
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
              config: (_, e) => ({ ..._.config, ...e.config }),
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
          },
        },
      },

      success: {
        type: "final",
        data: (context) => {
          return {
            node: context.node,
          };
        },
      },

      cancelled: {
        entry: escalate("Synth setup cancelled"),
        type: "final",
      },
    },
  },
  {
    services: {
      createSynthAudio: (context, event) => AudioSynthNode.create(),
    },
  }
);
