import { Suspendable } from "./recorder";

export const suspendAudio = async (context: Suspendable) => {
  await context.suspend();
};

export const resumeAudio = async (context: Suspendable) => {
  await context.resume();
};
