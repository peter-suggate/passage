import { Option, fold } from "fp-ts/lib/Option";
import { Observable } from "rxjs";
import { AudioRecorderEventTypes, AudioContextMin } from "./recorder-types";
import { TaskEither } from "fp-ts/lib/TaskEither";

export type AudioRecorderBase = {
  analyzer$: Observable<AudioRecorderEventTypes>;
  context: AudioContextMin;
};

export type StoppedAudioRecorder = { type: "stopped" } & AudioRecorderBase;
export type StartedAudioRecorder = { type: "running" } & AudioRecorderBase;

export type AudioRecorder =
  | {
      type: "starting";
      message:
        | "Connecting to media"
        | "Fetching and compiling analysis modules";
    }
  | { type: "stopping" }
  | StoppedAudioRecorder
  | StartedAudioRecorder
  | { type: "uninitialized" }
  | { type: "error"; message: string };

export type MaybeAudioRecorder = Option<AudioRecorder>;

export function audioRecorderStatus(recorder: MaybeAudioRecorder): string {
  return fold<AudioRecorder, string>(
    () => "uninitialized",
    (recorder) => recorder.type
  )(recorder);
}

export function audioRecorderStatusDetails(
  recorder: MaybeAudioRecorder
): string {
  return fold<AudioRecorder, string>(
    () => "uninitialized",
    (recorder) => {
      switch (recorder.type) {
        case "starting":
        case "error":
          return recorder.message;
        default:
          return "";
      }
    }
  )(recorder);
}

export type CreateAudioRecorderOptions = {
  onStatusChange: (state: AudioRecorder) => void;
};

export type AudioRecorderSetup = {
  create: <T extends CreateAudioRecorderOptions>(
    options: T
  ) => TaskEither<Error, StoppedAudioRecorder>;
  suspend: (
    recorder: StartedAudioRecorder
  ) => TaskEither<Error, StoppedAudioRecorder>;
  resume: (
    recorder: StoppedAudioRecorder
  ) => TaskEither<Error, StartedAudioRecorder>;
};
