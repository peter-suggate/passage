import { AudioAnalyzerNode } from "../recorder/webaudio/AudioRecorderNode";

export const getWebAudioMediaStream = async () =>
  globalThis.navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

export const connectAnalyzer = (
  context: AudioContext,
  node: AudioAnalyzerNode,
  mediaStream: MediaStream
) => {
  const audioSource = context.createMediaStreamSource(mediaStream);

  audioSource.connect(node.audioWorkletNode);

  node.audioWorkletNode.connect(context.destination);

  return node;
};

export const suspendAudio = async (context: AudioContext) => {
  await context.suspend();
};

export const resumeAudio = async (context: AudioContext) => {
  await context.resume();
};
