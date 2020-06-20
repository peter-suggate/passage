import { createMachine, interpret, assign, DoneInvokeEvent } from "xstate";
import { Observable } from "rxjs";
import { map, filter } from "rxjs/operators";
import { AudioRecorderNode } from "../recorder/webaudio/AudioRecorderNode";
import { AudioPitchEvent } from "../audio-types";
import { frequencyToNote, Note } from "./activeNote";
import { Pitch } from "music-analyzer-wasm-rs";
import { cast } from "@/lib/testing/partial-impl";

export type ActiveNoteContext = {
  analyzerEvents$?: AudioRecorderNode;
  note$?: Observable<Note>;
};

type Event =
  | { type: "PITCH_ADDED"; pitch: Pitch }
  | { type: "ONSET_ADDED"; t: number };

export type ActiveNoteState = {
  context: ActiveNoteContext;
} & ({ value: "running" } | { value: "noteActive" } | { value: "finished" });

export const activeNoteMachine = createMachine<
  ActiveNoteContext,
  Event,
  ActiveNoteState
>(
  {
    id: "ActiveNote",
    initial: "running",
    context: {
      note: undefined,
    } as ActiveNoteContext,
    states: {
      running: {
        entry: assign<ActiveNoteContext, Event>({
          note$: (context) =>
            context.analyzerEvents$?.pipe(
              filter((e) => e.type === "pitch"),
              map((e) =>
                frequencyToNote(cast<AudioPitchEvent>(e).pitch.frequency)
              )
            ),
        }),

        invoke: {
          src: "listen",
          onDone: {
            target: "finished",
          },
        },
      },

      finished: {
        type: "final",
      },
    },
  },
  {
    services: {
      listen: (context) =>
        context.analyzerEvents$!.pipe(
          filter((e) => e.type === "pitch"),
          map((e) =>
            e.type === "pitch"
              ? { type: "PITCH_ADDED", pitch: e.pitch }
              : { type: "ONSET_ADDED", t: e.t }
          )
        ),
    },
  }
);
