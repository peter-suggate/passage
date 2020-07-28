import { Observable } from 'rxjs';
import { AnalyzedNote } from '../audio/analysis';

type Passage {
  notes: AnalyzedNote[];
}

export const troublePassage$ = (
  nearestNotes$: Observable<AnalyzedNote>,
  // seconds = posNumber(5)
): Observable<AnalyzedNote[]> => {
  return distinctNote$(nearestNotes$).pipe(bufferLastByTime(seconds));
};
