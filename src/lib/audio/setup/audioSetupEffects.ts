import { AudioRecorderNode } from "../recorder/webaudio/AudioRecorderNode";

export const getWebAudioMediaStream = async () =>
  globalThis.navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

export const connectAnalyzer = (
  context: AudioContext,
  node: AudioRecorderNode,
  mediaStream: MediaStream
) => {
  const audioSource = context.createMediaStreamSource(mediaStream);

  audioSource.connect(node.audioWorkletNode);

  node.audioWorkletNode.connect(context.destination);

  return node;
};
