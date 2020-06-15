import { AudioAnalyzerNode } from "./AudioRecorderNode";
import {
  StoppedAudioRecorder,
  AudioRecorder,
  StartedAudioRecorder,
  AudioRecorderSetup,
  CreateAudioRecorderOptions,
} from "../AudioRecorder";
import {
  pipe,
  taskRight,
  tapTask,
  taskFromAsync,
  chainTask,
  mapTask,
} from "../../../fp-util";

const getWebAudioMediaStream = async () =>
  globalThis.navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

const createAnalyzer = (
  context: AudioContext,
  analyzerNode: AudioAnalyzerNode,
  mediaStream: MediaStream
): StoppedAudioRecorder => {
  const audioSource = context.createMediaStreamSource(mediaStream);

  const connectToAudioSource = (node: AudioAnalyzerNode) => {
    audioSource.connect(node.audioWorkletNode);
    return node;
  };

  const connectToDestination = (node: AudioAnalyzerNode) => {
    node.audioWorkletNode.connect(context.destination);
    return node;
  };

  return pipe(analyzerNode, connectToAudioSource, connectToDestination, () => ({
    type: "stopped",
    analyzer$: analyzerNode,
    context,
  }));
};

type Options = CreateAudioRecorderOptions & {
  getAudioMediaStream: () => Promise<MediaStream>;
};

export const createAudioRecorderTask = (optionsIn: Partial<Options>) => {
  const options = {
    getAudioMediaStream: getWebAudioMediaStream,
    onStatusChange: () => {},
    ...optionsIn,
  };

  return pipe(
    taskRight<Error, AudioRecorder>({
      type: "starting",
      message: "Connecting to media",
    }),
    tapTask(options.onStatusChange),

    chainTask(() => taskFromAsync(options.getAudioMediaStream)),
    mapTask((stream) => ({ stream })),

    mapTask(({ ...rest }) => ({
      context: new globalThis.AudioContext(),
      ...rest,
    })),

    tapTask(() =>
      options.onStatusChange({
        type: "starting",
        message: "Fetching and compiling analysis modules",
      })
    ),

    chainTask(({ context, ...rest }) =>
      pipe(
        AudioAnalyzerNode.create(context),
        mapTask((node) => ({
          node,
          context,
          ...rest,
        }))
      )
    ),

    mapTask(({ context, node, stream }) =>
      createAnalyzer(context, node, stream)
    ),

    tapTask(
      ({ analyzer$, context }) =>
        options.onStatusChange({
          type: "running",
          context,
          analyzer$,
        }),
      (error) =>
        options.onStatusChange({
          type: "error",
          message: error.message,
        })
    )
  );
};

async function resumeAudioRecorder(
  recorder: StoppedAudioRecorder
): Promise<StartedAudioRecorder> {
  const { context, analyzer$ } = recorder;

  if (context.state !== "suspended") {
    throw Error(
      `Cannot resume audio recording unless the audio context is suspended. Current state is ${context.state}`
    );
  }

  await context.resume();

  return {
    context,
    analyzer$,
    type: "running",
  };
}

const resumeAudioRecorderTask = (recorder: StoppedAudioRecorder) =>
  taskFromAsync(() => resumeAudioRecorder(recorder));

async function suspendAudioRecorder(
  recorder: StartedAudioRecorder
): Promise<StoppedAudioRecorder> {
  const { context, analyzer$ } = recorder;

  if (context.state !== "running") {
    throw Error(
      `Cannot stop audio recording unless the audio context is currently running. Current state is ${context.state}`
    );
  }

  await context.suspend();

  return {
    context,
    analyzer$,
    type: "stopped",
  };
}

const suspendAudioRecorderTask = (recorder: StartedAudioRecorder) =>
  taskFromAsync(() => suspendAudioRecorder(recorder));

export const webAudioRecorderSetup: AudioRecorderSetup = {
  create: createAudioRecorderTask,
  suspend: suspendAudioRecorderTask,
  resume: resumeAudioRecorderTask,
};
