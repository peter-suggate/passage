import { AudioWorklet } from "./AudioWorklet";

type AudioContextState = "closed" | "running" | "suspended";

export default class TestAudioContext {
  audioWorklet = new AudioWorklet();

  constructor() {}

  createMediaStreamSource() {
    return new MediaStreamSource();
  }

  state: AudioContextState = "closed";

  async suspend() {
    this.state = "suspended";
  }
  async resume() {
    this.state = "running";
  }
}

export class MediaStreamSource {
  connect() {}
}

(globalThis as any).AudioContext = TestAudioContext;
