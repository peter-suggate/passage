import { Observable } from "rxjs";
import {
  buffer,
  distinctUntilChanged,
  map,
  scan,
  filter,
} from "rxjs/operators";
import { AnalyzedNote } from "./analysis-types";
import { notesAreEqual, filterInBetweenNotes } from "./analysis-operators";
import { PosNumber, posNumber } from "@/lib/scales";

/**
 * Computes a single, distinct note that best represents a consecutive run of note pitches.
 *
 * @param notePitches
 */
export const distinctNote = (notePitches: AnalyzedNote[]) => {
  if (notePitches.length === 0)
    throw Error("Cannot calculate distinct note: insufficient note pitches");

  const accum = notePitches.reduce(
    (acc, cur) => ({
      cents: acc.cents + cur.cents,
      clarity: acc.clarity + cur.clarity,
    }),
    { cents: 0, clarity: 0 }
  );

  return {
    ...notePitches[0],
    cents: accum.cents / notePitches.length,
    clarity: accum.clarity / notePitches.length,
  };
};

const bufferLastByTime = <T extends { t: number }>(seconds: PosNumber) =>
  scan<T, T[]>((acc, curr) => {
    acc.push(curr);

    const indexOfFirstWithinBuffer = acc.findIndex(
      (item) => curr.t - item.t <= seconds
    );

    acc = acc.slice(indexOfFirstWithinBuffer);

    return acc;
  }, []);

export const distinctNote$ = (nearestNotes$: Observable<AnalyzedNote>) => {
  const cleanedNearestNotes$ = nearestNotes$.pipe(filterInBetweenNotes());

  return cleanedNearestNotes$.pipe(
    buffer(
      cleanedNearestNotes$.pipe(
        distinctUntilChanged((x, y) => notesAreEqual(x, y))
      )
    ),
    filter((notePitches) => notePitches.length > 0),
    map((notePitches) => distinctNote(notePitches))
  );
};

export const recentDistinctNotesByTime$ = (
  nearestNotes$: Observable<AnalyzedNote>,
  seconds = posNumber(5)
): Observable<AnalyzedNote[]> => {
  return distinctNote$(nearestNotes$).pipe(bufferLastByTime(seconds));
};
