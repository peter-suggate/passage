import { Observable } from "rxjs";
import { AnalyzedNote } from "../audio/analysis";
import { Passage } from "./passage-types";
import { recentDistinctNotesByTime$ } from "../audio/analysis/analysis-observables";
import { PosNumber, PosInteger, posInteger } from '../scales';
import { Opaque } from '../fp-util/opaque';

export type Seconds = Opaque<"Seconds", number>;

export const seconds = (value: number): Seconds => {
  if (value < 0) throw Error('A value in seconds must be > 0');

  return value as Seconds;
};

export type TroubleSpotDetectorOptions = {
  maxLengthSecs: Seconds;
  minNotes: PosInteger;
};

export const troubleSpot$ = (
  notes$: Observable<AnalyzedNote>,
  optionsIn?: Partial<TroubleSpotDetectorOptions>
  // seconds = posNumber(5)
): Observable<Passage> => {
  const options: TroubleSpotDetectorOptions = {
    maxLengthSecs: seconds(5),
    minNotes: posInteger(3),
    ...optionsIn
  };

  recentDistinctNotesByTime$(notes$).pipe(

  );
  // return distinctNote$(nearestNotes$).pipe(bufferLastByTime(seconds));
};
