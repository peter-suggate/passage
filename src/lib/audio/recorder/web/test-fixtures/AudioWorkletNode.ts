import { MessagePort } from "./AudioWorkletProcessor";

export class AudioWorkletNode {
  port = new MessagePort();

  connect() {}
}

const globalAsAny = globalThis as any;
globalAsAny.AudioWorkletNode = AudioWorkletNode;
