import { Observable } from "rxjs";
import { AnalyzedNote } from "../audio/analysis";
import { Passage } from "./passage-types";
import { recentDistinctNotesByTime$ } from "../audio/analysis/analysis-observables";

export const detectTroublePassage$ = (
  notes$: Observable<AnalyzedNote>
  // seconds = posNumber(5)
): Observable<Passage> => {
  recentDistinctNotesByTime$(notes$).pipe;
  // return distinctNote$(nearestNotes$).pipe(bufferLastByTime(seconds));
};
