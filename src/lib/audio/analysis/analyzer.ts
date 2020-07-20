import { AudioRecorderEventTypes } from "../recorder";
import { partition, Observable, pipe } from "rxjs";
import { AudioRecorderNode } from "../recorder/webaudio/AudioRecorderNode";
import { AudioSynthesizer } from "../recorder/synthaudio/AudioSynthesizer";
import {
  withLatestFrom,
  scan,
  map,
  distinctUntilChanged,
  filter,
  // bufferCount,
  pairwise,
  flatMap,
} from "rxjs/operators";
import { cast } from "@/lib/testing/partial-impl";
import { AudioPitchEvent, AudioOnsetEvent } from "../audio-types";
import { frequencyToNearestNote } from "./nearestNote";
import { Note, integer } from "@/lib/scales";
import { closestMatches, musicBank, pieceMatch } from "@/lib/music-recognition";
import { NoteDelta } from "@/lib/music-recognition/noteDeltas";
import { PhraseBuilder } from "@/lib/music-recognition/PhraseBuilder";

type PartitionedEvents = [AudioRecorderEventTypes, AudioRecorderEventTypes];

// const skipTransitionsBetweenDifferentPitches = () =>
//   pipe(
//     pairwise<AudioPitchEvent>(),
//     flatMap((pair) => {
//       const delta = pair[1].pitch.frequency / pair[0].pitch.frequency;
//       // if (delta >= 1.05946 || delta < 1 / 1.05946) {
//       //   return [];
//       // }
//       return [pair[0]];
//     })
//   );

/**
 * Collects the last N events into an array, maintaining the last N events.
 *
 * @param N The number of events to buffer
 */
const bufferLast = <T>(N = 5) =>
  scan<T, T[]>((acc, curr) => {
    acc.push(curr);

    if (acc.length > N) {
      acc.shift();
    }

    return acc;
  }, []);

const median = () =>
  map((arr: PartitionedEvents[]) => {
    arr
      .slice()
      .sort(
        (a, b) =>
          cast<AudioPitchEvent>(a[0]).pitch.frequency -
          cast<AudioPitchEvent>(b[0]).pitch.frequency
      );

    // const HALF_AVERAGE_WINDOW = 5;
    // const middle = arr.length / 2 | 0;
    // const startIndex = middle - HALF_AVERAGE_WINDOW;
    // const endIndex = middle + HALF_AVERAGE_WINDOW;
    // return arr.slice(startIndex, endIndex).reduce((acc, curr) => acc + curr, arr[0]);
    // console.log(
    //   arr.map((a) => cast<AudioPitchEvent>(a[0]).pitch.frequency)
    // );
    return arr[(arr.length / 2) | 0];
  });

type NearestNote = {
  clarity: number;
  age: number;
  value: Note;
  octave: number;
  cents: number;
};

const nearestNote = () =>
  map<PartitionedEvents, NearestNote>(([p, onset]) => {
    const { pitch } = cast<AudioPitchEvent>(p);
    const { t } = cast<AudioOnsetEvent>(onset);
    return {
      ...frequencyToNearestNote(pitch.frequency),
      clarity: pitch.clarity,
      age: pitch.t - t,
    };
  });

export const nearestNotes$ = (
  analyzerEvents$: AudioRecorderNode | AudioSynthesizer
) => {
  const [onsets$, pitches$] = partition(
    analyzerEvents$,
    (e) => e.type === "onset"
  );

  return cast<Observable<AudioPitchEvent>>(pitches$).pipe(
    // pairwise<AudioPitchEvent>(),
    // filter((pair) => {
    //   const delta = pair[1].pitch.frequency / pair[0].pitch.frequency;
    //   // console.log(pair[1].pitch.frequency, pair[0].pitch.frequency, delta);
    //   if (delta >= 1.04 /*1.05946*/ || delta < 0.965 /*1 / 1.05946*/) {
    //     return false;
    //   }
    //   return true;
    // }),
    // map((pair) => pair[0]),
    // flatMap((pair) => {
    //   const delta = pair[1].pitch.frequency / pair[0].pitch.frequency;
    //   if (delta >= 1.05946 || delta < 1 / 1.05946) {
    //     return [];
    //   }
    //   return [pair[0]];
    // }),
    // skipTransitionsBetweenDifferentPitches(),
    withLatestFrom(onsets$),
    bufferLast(5),
    median(),
    nearestNote()
  );
};

export const recentDistinctNotes$ = (
  nearestNotes$: Observable<NearestNote>,
  N = 20
) => {
  return nearestNotes$.pipe(
    pairwise(),
    filter((pair) => pair[1].value === pair[0].value),
    map((pair) => pair[0]),
    distinctUntilChanged((x, y) => x.value === y.value),
    bufferLast(N)
  );
};

export const mapNotesToNoteDeltas = () =>
  map<NearestNote[], NoteDelta[]>((notes) => {
    return PhraseBuilder().push(
      ...notes.map((note) => ({
        value: note.value,
        octave: integer(note.octave),
      }))
    ).noteDeltas;
  });

export const closestMatchingPieces$ = (minNotes = 5, maxMatches = 5) => (
  recentDistinctNotes$: Observable<NearestNote[]>
) => {
  const pieces = musicBank();

  return recentDistinctNotes$.pipe(
    filter((notes) => notes.length >= minNotes),
    mapNotesToNoteDeltas(),
    map((noteDeltas) => closestMatches(noteDeltas, pieces).slice(0, maxMatches))
  );
};

/**
 * Return best matching piece so long as a minimum number of notes have been
 * sampled and the match criteria reaches a certain threshold.
 *
 * @param minNotes Minimum notes required before an event can possibly be emitted.
 * @param maxEditDistance The maximum allowed deviation from a perfect match.
 */
export const matchedPiece$ = (minNotes = 10, maxEditDistance = 3) => (
  recentDistinctNotes$: Observable<NearestNote[]>
) => {
  const pieces = musicBank();

  return recentDistinctNotes$.pipe(
    filter((notes) => notes.length >= minNotes),
    mapNotesToNoteDeltas(),
    map((noteDeltas) => pieceMatch(noteDeltas, pieces))
    // Only return match if it's good.
    // filter((closest) => closest.distance <= maxEditDistance)
  );
};
