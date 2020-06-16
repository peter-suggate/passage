export class MediaStream {}

class FakeMediaDevices {
  async getUserMedia(options: { audio: boolean; video: boolean }) {
    return new MediaStream();
  }
}
(globalThis as any).navigator = {
  mediaDevices: new FakeMediaDevices()
};
