// import { createMachine } from "xstate";

// export type SynthesizerContext = {
//   instrument: "bell" | "violin";
// };

// type Event = { type: "FINISH" } | { type: "CANCEL" };

// export type SynthesizerState = {
//   context: SynthesizerContext;
// } & ({ value: "running" } | { value: "cancelled" });

// export const runSynthesizerMachine = createMachine<
//   SynthesizerContext,
//   Event,
//   SynthesizerState
// >(
//   {
//     id: "Synthesizer",
//     initial: "running",
//     // context: { instrument: "bell" },
//     states: {
//       running: {
//         on: {
//           CANCEL: "cancelled",
//         },
//       },

//       cancelled: {
//         type: "final",
//       },
//     },
//   },
//   {
//     services: {},
//   }
// );
