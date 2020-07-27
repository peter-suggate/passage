import { AudioRecorderEventTypes } from "../recorder";
import { partition, Observable } from "rxjs";
import {
  withLatestFrom,
  scan,
  map,
  distinctUntilChanged,
} from "rxjs/operators";
import { cast } from "@/lib/testing/partial-impl";
import { AudioPitchEvent, AudioOnsetEvent } from "../audio-types";
import { frequencyToNearestNote } from "./nearestNote";
import { NearestNote } from "./analysis-types";
import { filterInBetweenNotes } from "./analysis-operators";
import { posInteger } from "@/lib/scales";

type PartitionedEvents = [AudioRecorderEventTypes, AudioRecorderEventTypes];

/**
 * Collects the last N events into an array, maintaining the last N events.
 *
 * @param N The number of events to buffer
 */
const bufferLast = <T>(N = posInteger(5)) =>
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

const nearestNote = () =>
  map<PartitionedEvents, NearestNote>(([p, onset]) => {
    const { pitch } = cast<AudioPitchEvent>(p);
    const { t } = cast<AudioOnsetEvent>(onset);
    return {
      ...frequencyToNearestNote(pitch.frequency),
      clarity: pitch.clarity,
      t: pitch.t,
      age: pitch.t - t,
    };
  });

export const nearestNotes$ = (
  analyzerEvents$: Observable<AudioRecorderEventTypes>
) => {
  const [onsets$, pitches$] = partition(
    analyzerEvents$,
    (e) => e.type === "onset"
  );

  return cast<Observable<AudioPitchEvent>>(pitches$).pipe(
    withLatestFrom(onsets$),
    bufferLast(posInteger(5)),
    median(),
    nearestNote()
  );
};

export const distinctNotes$ = (nearestNotes$: Observable<NearestNote>) => {
  return nearestNotes$.pipe(
    filterInBetweenNotes(),
    distinctUntilChanged((x, y) => x.value === y.value)
  );
};

export const recentDistinctNotes$ = (
  nearestNotes$: Observable<NearestNote>,
  N = posInteger(20)
) => {
  return nearestNotes$.pipe(
    filterInBetweenNotes(),
    distinctUntilChanged((x, y) => x.value === y.value),
    bufferLast(N)
  );
};
