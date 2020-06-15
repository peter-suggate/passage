import { FakeAudioSubject } from "./FakeAudioSubject";
import {
  StoppedAudioRecorder,
  AudioRecorder,
  StartedAudioRecorder,
  AudioRecorderSetup,
} from "../AudioRecorder";
import {
  pipe,
  taskRight,
  tapTask,
  taskFromAsync,
  chainTask,
  mapTask,
} from "../../../fp-util";
import { AudioContextMin } from "../recorder-types";

const createAnalyzer = (
  context: AudioContextMin,
  analyzerNode: FakeAudioSubject
): StoppedAudioRecorder => {
  return pipe(analyzerNode, () => ({
    type: "stopped",
    analyzer$: analyzerNode,
    context,
  }));
};

type Options = {
  onStatusChange: (state: AudioRecorder) => void;
};

const createAudioRecorderTask = (optionsIn: Partial<Options>) => {
  const options = {
    onStatusChange: () => {},
    ...optionsIn,
  };

  return pipe(
    taskRight<Error, AudioRecorder>({
      type: "starting",
      message: "Connecting to media",
    }),
    tapTask(options.onStatusChange),

    tapTask(() =>
      options.onStatusChange({
        type: "starting",
        message: "Fetching and compiling analysis modules",
      })
    ),

    chainTask(({ ...rest }) =>
      pipe(
        FakeAudioSubject.create(),
        mapTask((node) => ({
          node,
          context: node,
          ...rest,
        }))
      )
    ),

    mapTask(({ context, node }) => createAnalyzer(context, node)),

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

export const fakeAudioRecorderSetup: AudioRecorderSetup = {
  create: createAudioRecorderTask,
  suspend: suspendAudioRecorderTask,
  resume: resumeAudioRecorderTask,
};
