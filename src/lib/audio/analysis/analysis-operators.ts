import { Observable, defer } from "rxjs";
import {
  filter,
  map,
  bufferCount,
  pairwise,
  tap,
  scan,
  mergeMap,
} from "rxjs/operators";
import { AnalyzedNote } from "./analysis-types";

export const notesAreEqual = (a: AnalyzedNote, b: AnalyzedNote) => {
  return a.value === b.value && a.octave === b.octave;
};

/**
 * Removes notes that appear to have been formed from pitches generated in between
 * two adjacent notes. e.g. for CCCC-C#-DDDD, C# will re omitted.
 *
 * @param nearestNotes$
 */
export const filterTransitions = <T>(compareIn?: (a: T, b: T) => boolean) => (
  source: Observable<T>
): Observable<T> => {
  const compare = compareIn || ((a: T, b: T) => a === b);

  return defer(() =>
    source.pipe(
      bufferUntilChanged(compare),
      filter((buffer) => buffer.length >= 3),
      mergeMap((triple) => triple)
    )
  );
};

// Like buffer + distinctUntilChanged
export const bufferUntilChanged = <T>(compareIn?: (a: T, b: T) => boolean) => {
  const compare = compareIn || ((a: T, b: T) => a === b);

  return scan<T, T[]>((acc, curr) => {
    if (acc.length === 0 || compare(curr, acc[acc.length - 1])) {
      acc.push(curr);
    } else {
      acc = [curr];
    }

    return acc;
  }, []);
};

//   /**
//    * Emits only when the value changes.
//    */
// export const filterNoteChanges = (getValue =>) => (
//   source: Observable<AnalyzedNote>
// ): Observable<AnalyzedNote> =>
//   defer(() => source.pipe(
//     pairwise(),
//     map(pair => {
//       if (pair[1].value)
//     })
//   ));
