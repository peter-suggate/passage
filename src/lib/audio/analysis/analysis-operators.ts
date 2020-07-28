import { Observable, defer } from "rxjs";
import { filter, map, bufferCount, pairwise, tap } from "rxjs/operators";
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
export const filterInBetweenNotes = () => (
  source: Observable<AnalyzedNote>
): Observable<AnalyzedNote> =>
  defer(() =>
    source.pipe(
      bufferCount(3),
      // Emit nothing if insufficient notes (source completes before emitting 3).
      filter((buffer) => buffer.length === 3),
      filter(
        (triple) =>
          notesAreEqual(triple[0], triple[1]) &&
          notesAreEqual(triple[1], triple[2])
      ),
      map((triple) => triple[0])
    )
  );

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
