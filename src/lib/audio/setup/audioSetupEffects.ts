import { AudioRecorderNode } from "../recorder/webaudio/AudioRecorderNode";

export const getWebAudioMediaStream = async () => {
  if (!globalThis.navigator.mediaDevices) {
    throw new Error(
      "This browser does not support web audio or it is not enabled."
    );
  }

  try {
    const result = await globalThis.navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    return result;
  } catch (e) {
    switch (e.name) {
      case "NotAllowedError":
        throw new Error(
          "A recording device was found but has been disallowed for this application. Enable the device in the browser's settings."
        );

      case "NotFoundError":
        throw new Error(
          "No recording device was found. Please attach a microphone and click Retry."
        );
    }

    throw e;
  }
};

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
