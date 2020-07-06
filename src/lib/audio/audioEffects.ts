import { Suspendable } from "./recorder";

export const suspendAudio = async (suspendable: Suspendable) => {
  return await suspendable.suspend();
};

export const resumeAudio = async (suspendable: Suspendable) => {
  return await suspendable.resume();
};
