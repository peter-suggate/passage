import { createMachine, assign, interpret } from "xstate";
import { Observable, of } from "rxjs";
import { map, filter } from "rxjs/operators";
import { Pitch } from "music-analyzer-wasm-rs";
import { Note } from "@/lib/scales";
import { AudioRecorderNode } from "@/lib/audio/recorder/webaudio/AudioRecorderNode";
import { AudioSynthesizer } from "@/lib/audio/recorder/synthaudio/AudioSynthesizer";
import { NearestNote } from "@/lib/audio/analysis";
import {
  nearestNotes$,
  recentDistinctNotes$,
  closestMatchingPieces$,
} from "@/lib/audio/analysis/analyzer";
import { ClosestMatches } from "@/lib/music-recognition";

// export type NoteInfo = {
//   value: Note;
//   clarity: number;
//   age: number;
// };

export type ListenContext = {
  // This is passed
  analyzerEvents$?: AudioRecorderNode | AudioSynthesizer;
  note$?: Observable<NearestNote>;
  recentDistinct$: Observable<NearestNote[]>;
  closestMatchingPieces$: Observable<ClosestMatches>;
};

type Event =
  | { type: "PITCH_ADDED"; pitch: Pitch }
  | { type: "ONSET_ADDED"; t: number };

export type ListenState = {
  context: ListenContext;
} & ({ value: "running" } | { value: "noteActive" } | { value: "finished" });

export const listenMachine = createMachine<ListenContext, Event, ListenState>(
  {
    id: "ActiveNote",
    initial: "running",
    context: {
      note$: of({ value: "A" } as NearestNote),
      recentDistinct$: of([]),
      closestMatchingPieces$: of([]),
    } as ListenContext,
    states: {
      running: {
        // entry: {
        //   actions: assign({
        //     note$: (context) => nearestNotes$(context.analyzerEvents$!),
        //     recentDistinct$: recentDistinctNotes$(context.analyzerEvents$!),
        //   }),
        // },
        entry: (context) => {
          const note$ = nearestNotes$(context.analyzerEvents$!);
          const recentDistinct$ = recentDistinctNotes$(note$);

          const MIN_NOTES_BEFORE_ATTEMPT_MATCH = 5;
          const MAX_MATCHES = 5;
          const detectedPieces$ = closestMatchingPieces$(
            MIN_NOTES_BEFORE_ATTEMPT_MATCH,
            MAX_MATCHES
          )(recentDistinct$);

          // return {
          //   note$: () => assign({ note$ }),
          //   recentDistinct$: () => assign({ recentDistinct$ }),
          // };

          // return assign(() => ({
          //   note$,
          //   recentDistinct$,
          // }));
          context.note$ = note$;
          context.recentDistinct$ = recentDistinct$;
          context.closestMatchingPieces$ = detectedPieces$;
          // assign<ListenContext, Event>({
          //   note$,
          //   recentDistinct$,
          // });
        },

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

// Machine instance with internal state
export const makeListenService = () =>
  interpret(listenMachine)
    .onTransition((state) => console.log(state.value, state.context))
    .start();

export type ListenService = ReturnType<typeof makeListenService>;
