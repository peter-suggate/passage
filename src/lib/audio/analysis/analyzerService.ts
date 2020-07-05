import { Machine } from "xstate";

/**
 * Machine that runs an audio recorder (or synthesizer) in parallel with the music analyzer.
 */

export const analyzerMachine = Machine(
  {
    id: "analyzer",
    type: "parallel",
    states: {
      record: {
        initial: "recording",
        states: {
          recording: {
            on: {
              STOP: "suspended",
            },
          },
          suspended: {
            type: "final",
          },
        },
      },
      analyze: {
        initial: "running",
        states: {
          running: {
            on: {
              STOP: "suspended",
            },
          },
          suspended: {
            type: "final",
          },
        },
      },
    },
  },
  {
    services: {},
  }
);
