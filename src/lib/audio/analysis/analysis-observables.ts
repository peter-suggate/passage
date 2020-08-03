import { Observable } from "rxjs";
import { map, scan, filter, tap } from "rxjs/operators";
import { AnalyzedNote } from "./analysis-types";
import {
  notesAreEqual,
  filterTransitions,
  bufferUntilChanged,
  log,
} from "./analysis-operators";
import { seconds, Seconds } from "@/lib/scales";

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

export const filterTransitionNote = () => filterTransitions(notesAreEqual);

const bufferLastByTime = <T extends { t: number }>(seconds: Seconds) =>
  scan<T, T[]>((acc, curr) => {
    acc.push(curr);

    const indexOfFirstWithinBuffer = acc.findIndex(
      (item) => curr.t - item.t <= seconds
    );

    acc = acc.slice(indexOfFirstWithinBuffer);

    return acc;
  }, []);

export const distinctNote$ = (note$: Observable<AnalyzedNote>) => {
  return note$.pipe(
    filterTransitionNote(),
    bufferUntilChanged(notesAreEqual),
    filter((notePitches) => notePitches.length > 0),
    map((notePitches) => distinctNote(notePitches))
  );
};

export const recentDistinctNotesByTime$ = (
  note$: Observable<AnalyzedNote>,
  secs = seconds(5)
): Observable<AnalyzedNote[]> => {
  return distinctNote$(note$).pipe(bufferLastByTime(secs));
};
