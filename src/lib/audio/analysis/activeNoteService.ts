import { createMachine, assign } from "xstate";
import { Observable, partition, of } from "rxjs";
import { map, filter, withLatestFrom, scan } from "rxjs/operators";
import { AudioRecorderNode } from "../recorder/webaudio/AudioRecorderNode";
import { AudioPitchEvent, AudioOnsetEvent } from "../audio-types";
import { frequencyToNearestNote } from "./nearestNote";
import { Pitch } from "music-analyzer-wasm-rs";
import { cast } from "@/lib/testing/partial-impl";
import { AudioRecorderEventTypes } from "../recorder";
import { AudioSynthesizer } from "../recorder/synthaudio/AudioSynthesizer";
import { Note } from "@/lib/scales";
import { analyzer$ } from "./analyzer";

export type NoteInfo = {
  value: Note;
  clarity: number;
  age: number;
};

export type ActiveNoteContext = {
  analyzerEvents$?: AudioRecorderNode | AudioSynthesizer;
  note$?: Observable<NoteInfo>;
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
      note$: of({ value: "A" } as NoteInfo),
    } as ActiveNoteContext,
    states: {
      running: {
        entry: assign<ActiveNoteContext, Event>({
          note$: (context) => analyzer$(context.analyzerEvents$),
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
