import { Observable, defer, merge } from "rxjs";
import {
  filter,
  tap,
  mergeMap,
  buffer,
  distinctUntilChanged,
  publish,
  last,
  defaultIfEmpty,
} from "rxjs/operators";
import { AnalyzedNote } from "./analysis-types";

export const notesAreEqual = (a: AnalyzedNote, b: AnalyzedNote) => {
  return a.value === b.value && a.octave === b.octave;
};

// Like buffer + distinctUntilChanged
export const bufferUntilChanged = <T>(compareIn?: (a: T, b: T) => boolean) => (
  source: Observable<T>
) => {
  const compare = compareIn || ((a: T, b: T) => a === b);

  return defer(() =>
    source.pipe(
      publish((published) =>
        published.pipe(
          buffer(
            merge(
              published.pipe(distinctUntilChanged(compare)),
              // For correctness, return any buffer immediately prior to source completion
              // (where our comparator never gets invoked).
              published.pipe(defaultIfEmpty(), last())
            )
          ),
          filter((buffer) => buffer.length > 0)
        )
      )
    )
  );
};

export const log = <T>() => (source: Observable<T>): Observable<T> => {
  return defer(() => source.pipe(tap((e) => console.log(e))));
};

/**
 * Removes notes that appear to have been formed from pitches generated in between
 * two adjacent notes. e.g. for CCCC-C#-DDDD, C# will be omitted.
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
