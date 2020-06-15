export class MessagePort {
  constructor() {}

  postMessage(m: string) {}
  onmessage() {}
}

export default class AudioWorkletProcessor {
  port: MessagePort = new MessagePort();
}

const globalAsAny = globalThis as any;
globalAsAny.AudioWorkletProcessor = AudioWorkletProcessor;
globalAsAny.registerProcessor = () => {};
