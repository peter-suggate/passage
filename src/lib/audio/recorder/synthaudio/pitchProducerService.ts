/**
 * State machine to help with generating sequences of pitches to help test certain
 * scenarios. e.g. Allow switching from one piece to another or adding regions of
 * silence.
 */

import { createMachine, assign, interpret } from "xstate";
import { Piece } from "@/lib/music-recognition";
import { NonNegInteger } from "@/lib/scales";
import { pitchProducer, PitchProducerConfig } from "./pitchProducer";

export type PitchProducerContext = {
  current: "silence" | Piece;
  producer?: (ms: NonNegInteger) => number;
};

type Event =
  | {
      type: "START_PIECE";
      config: PitchProducerConfig;
    }
  | { type: "PAUSE" };

export type PitchProducerState = {
  context: PitchProducerContext;
} & ({ value: "silence" } | { value: "playing"; piece: Piece });

const pitchProducerMachine = createMachine<
  PitchProducerContext,
  Event,
  PitchProducerState
>(
  {
    id: "PitchProducer",
    initial: "silence",
    context: { current: "silence" },
    states: {
      silence: {
        on: {
          START_PIECE: {
            actions: assign({
              current: (_, e) => e.config.piece,
              producer: (_, e) => pitchProducer(e.config),
            }),
          },
        },
      },
    },
  },
  {
    services: {},
    actions: {},
  }
);

export const makePitchProducerService = () =>
  interpret(pitchProducerMachine)
    // .onTransition((state) => console.log(state.value, state.context))
    .start();

export type PitchProducerService = ReturnType<typeof makePitchProducerService>;
