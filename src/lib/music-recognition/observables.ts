import { Observable } from "rxjs";
import { map, filter } from "rxjs/operators";
import { AnalyzedNote } from "../audio/analysis";
import { NoteDelta } from "./noteDeltas";
import { PhraseBuilder } from "./PhraseBuilder";
import { integer } from "../scales";
import { musicBank } from "./musicBank";
import { closestMatches, pieceMatch } from "./phraseMatch";

export const mapNotesToNoteDeltas = () =>
  map<AnalyzedNote[], NoteDelta[]>((notes) => {
    return PhraseBuilder().push(
      ...notes.map((note) => ({
        value: note.value,
        octave: integer(note.octave),
      }))
    ).noteDeltas;
  });

export const closestMatchingPieces$ = (minNotes = 5, maxMatches = 5) => (
  recentDistinctNotes$: Observable<AnalyzedNote[]>
) => {
  const pieces = musicBank();

  return recentDistinctNotes$.pipe(
    filter((notes) => notes.length >= minNotes),
    mapNotesToNoteDeltas(),
    map((noteDeltas) => closestMatches(noteDeltas, pieces).slice(0, maxMatches))
  );
};

/**
 * Return best matching piece so long as a minimum number of notes have been
 * sampled and the match criteria reaches a certain threshold.
 *
 * @param minNotes Minimum notes required before an event can possibly be emitted.
 * @param maxEditDistance The maximum allowed deviation from a perfect match.
 */
export const matchedPiece$ = (minNotes = 10, maxEditDistance = 3) => (
  recentDistinctNotes$: Observable<AnalyzedNote[]>
) => {
  const pieces = musicBank();

  return recentDistinctNotes$.pipe(
    filter((notes) => notes.length >= minNotes),
    mapNotesToNoteDeltas(),
    map((noteDeltas) => pieceMatch(noteDeltas, pieces)),
    // Only return match if it's good.
    filter((closest) => closest.distance <= maxEditDistance)
  );
};
