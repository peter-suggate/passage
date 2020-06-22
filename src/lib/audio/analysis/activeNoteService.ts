import { createMachine, interpret, assign, DoneInvokeEvent } from "xstate";
import { Observable, combineLatest, partition, from, of } from "rxjs";
import { map, filter, withLatestFrom, scan } from "rxjs/operators";
import { AudioRecorderNode } from "../recorder/webaudio/AudioRecorderNode";
import { AudioPitchEvent, AudioOnsetEvent } from "../audio-types";
import { frequencyToNearestNote, Note } from "./nearestNote";
import { Pitch } from "music-analyzer-wasm-rs";
import { cast } from "@/lib/testing/partial-impl";
import { AudioRecorderEventTypes } from "../recorder";

export type NoteInfo = {
  value: Note;
  clarity: number;
  age: number;
};

export type ActiveNoteContext = {
  analyzerEvents$?: AudioRecorderNode;
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
          note$: (context) => {
            type PartitionedEvents = [
              AudioRecorderEventTypes,
              AudioRecorderEventTypes
            ];

            const [onsets$, pitches$] = partition(
              context.analyzerEvents$!,
              (e) => e.type === "onset"
            );

            return pitches$.pipe(
              withLatestFrom(onsets$),
              scan<PartitionedEvents, PartitionedEvents[]>((acc, curr) => {
                acc.push(curr);

                if (acc.length > 25) {
                  acc.shift();
                }

                return acc;
              }, []),
              map((arr) => {
                arr
                  .slice()
                  .sort(
                    (a, b) =>
                      cast<AudioPitchEvent>(a[0]).pitch.frequency -
                      cast<AudioPitchEvent>(b[0]).pitch.frequency
                  );
                return arr[(arr.length / 2) | 0];
              }),
              map(([p, onset]) => {
                const { pitch } = cast<AudioPitchEvent>(p);
                const { t } = cast<AudioOnsetEvent>(onset);
                return {
                  ...frequencyToNearestNote(pitch.frequency),
                  clarity: pitch.clarity,
                  age: pitch.t - t,
                };
              })
            );
            // return combineLatest(onsets$, pitches$).pipe(
            //   map((e) => {
            //     const { pitch } = cast<AudioPitchEvent>(e);
            //     return {
            //       value: frequencyToNote(pitch.frequency),
            //       clarity: pitch.clarity,
            //       age: 0,
            //     };
            //   })
            // );
          },
          // context.analyzerEvents$?.pipe(
          //   partition(
          //     e.type
          //   )
          //   // takeL
          //   filter((e) => e.type === "pitch"),
          //   map((e) => {
          //     const { pitch } = cast<AudioPitchEvent>(e);
          //     return {
          //       value: frequencyToNote(pitch.frequency),
          //       clarity: pitch.clarity,
          //       age: 0,
          //     };
          //   })
          // ),
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
