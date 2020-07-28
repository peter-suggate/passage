import { Observable } from "rxjs";
import { map, scan, filter, tap } from "rxjs/operators";
import { AnalyzedNote } from "./analysis-types";
import { notesAreEqual, filterTransitions } from "./analysis-operators";
import { PosNumber, posNumber, Note } from "@/lib/scales";

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

const bufferUntilChanged = <T extends { value: Note }>() =>
  scan<T, T[]>((acc, curr) => {
    if (acc.length === 0 || curr.value === acc[acc.length - 1].value) {
      acc.push(curr);
    } else {
      acc = [];
    }

    return acc;
  }, []);

export const distinctNote$ = (note$: Observable<AnalyzedNote>) => {
  const cleanedNotes$ = note$.pipe(
    filterTransitions(notesAreEqual)
    // tap((e) => console.log(e))
  );

  return cleanedNotes$.pipe(
    // tap((e) => console.log(e)),
    bufferUntilChanged(),
    // buffer(
    //   cleanedNotes$.pipe(
    //     // tap((e) => console.log(e)),
    //     distinctUntilChanged((x, y) => notesAreEqual(x, y))
    //     // tap((e) => console.log(e))
    //   )
    // ),
    tap((e) => console.log(e)),
    filter((notePitches) => notePitches.length > 0),
    map((notePitches) => distinctNote(notePitches))
  );
};

export const recentDistinctNotesByTime$ = (
  note$: Observable<AnalyzedNote>,
  seconds = posNumber(5)
): Observable<AnalyzedNote[]> => {
  return distinctNote$(note$).pipe(
    // tap((e) => console.log(e)),
    bufferLastByTime(seconds)
  );
};
