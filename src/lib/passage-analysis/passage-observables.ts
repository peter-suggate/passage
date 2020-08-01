import { Observable } from "rxjs";
import { AnalyzedNote } from "../audio/analysis";
import { Passage } from "./passage-types";
import { recentDistinctNotesByTime$ } from "../audio/analysis/analysis-observables";
import { PosNumber, PosInteger, posInteger } from "../scales";
import { Opaque } from "../fp-util/opaque";
import { scan, map } from "rxjs/operators";

export type Seconds = Opaque<"Seconds", number>;

export const seconds = (value: number): Seconds => {
  if (value < 0) throw Error("A value in seconds must be > 0");

  return value as Seconds;
};

export type TroubleSpotDetectorOptions = {
  maxLengthSecs: Seconds;
  minNotes: PosInteger;
};

// export const troubleSpot$ = (
//   notes$: Observable<AnalyzedNote>,
//   optionsIn?: Partial<TroubleSpotDetectorOptions>
//   // seconds = posNumber(5)
// ): Observable<Passage> => {
//   const options: TroubleSpotDetectorOptions = {
//     maxLengthSecs: seconds(5),
//     minNotes: posInteger(3),
//     ...optionsIn,
//   };

//   recentDistinctNotesByTime$(notes$, options.maxLengthSecs).pipe(
//     scan<AnalyzedNote, AnalyzedNote[]>((acc, curr) => {
//       return acc;
//     }, [])
//   );
//   // return distinctNote$(nearestNotes$).pipe(bufferLastByTime(seconds));
// };

export const averagedQuality$ = (
  note$: Observable<AnalyzedNote>
): Observable<number> => {
  return recentDistinctNotesByTime$(note$, seconds(5)).pipe(
    map(
      (recentNotes) =>
        recentNotes.reduce((accum, note) => accum + Math.abs(note.cents), 0) /
        recentNotes.length
    )
    // scan((acc, value) => {}, [])
  );
};
