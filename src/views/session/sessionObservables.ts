import { Observable } from "rxjs";
import { recentDistinctNotes$ } from "@/lib/audio/analysis/analyzer";
import { share } from "rxjs/operators";
import { AnalyzedNote } from "@/lib/audio/analysis";
import {
  closestMatchingPieces$,
  matchedPiece$,
} from "@/lib/music-recognition/observables";
import { averagedQuality$ } from "@/lib/passage-analysis/passage-observables";

/**
 * From pitch events produced by the recorder, returns all the observables needed in
 * order to detect the current music being played.
 *
 * @param events$ Observable of audio events produced by the recorder.
 */
export const sessionObservables = (
  note$: Observable<AnalyzedNote>
  // note$ = nearestNotes$(recordedEvents$);
  // recordedEvents$: Observable<AudioRecorderEventTypes>
) => {
  // Convert pitch frequencies to closest notes.
  // const note$ = nearestNotes$(recordedEvents$);

  // Buffer the last N distinct notes.
  const recentDistinct$ = recentDistinctNotes$(note$).pipe(share());

  // Maintain a list of the closest N music piece matches based on the
  // recent notes.
  const MIN_NOTES_BEFORE_ATTEMPT_MATCH = 5;
  const MAX_MATCHES = 5;
  const closestMatching$ = closestMatchingPieces$(
    MIN_NOTES_BEFORE_ATTEMPT_MATCH,
    MAX_MATCHES
  )(recentDistinct$);

  // Best match - once enough notes have been sampled and a good match found.
  const MIN_NOTES_FOR_EXACT_MATCH = 10;
  const MAX_EDIT_DISTANCE_FOR_EXACT_MATCH = 3;
  const confirmedMatch$ = matchedPiece$(
    MIN_NOTES_FOR_EXACT_MATCH,
    MAX_EDIT_DISTANCE_FOR_EXACT_MATCH
  )(recentDistinct$);

  return {
    note$,
    recentDistinctNotes$: recentDistinct$,
    averageQuality$: averagedQuality$(note$),
    closestMatchingPieces$: closestMatching$,
    matchedPiece$: confirmedMatch$,
  };
};

export type SessionObservables = ReturnType<typeof sessionObservables>;
