import { Observable } from "rxjs";
import { map as map$, filter as filter$ } from "rxjs/operators";
import { AudioRecorderEventTypes } from "../recorder";
import { AudioPitchEvent } from "../audio-types";
import {
  Note,
  NOTES,
  CONCERT_PITCH,
  CONCERT_A_HALFTONE_INDEX,
} from "@/lib/scales";

type AnalyzedNote = {
  value: Note;
  octave: number;
  cents: number;
};

export const frequencyToNearestNote = (
  hz: number,
  concertPitch = CONCERT_PITCH
): AnalyzedNote => {
  const nearestNote = Math.round(12 * Math.log2(hz / concertPitch));
  const noteAndOctave = CONCERT_A_HALFTONE_INDEX + nearestNote;
  const nearestNoteHz = concertPitch * Math.pow(2, nearestNote / 12);

  const result = {
    value: NOTES[noteAndOctave % 12],
    octave: Math.floor(noteAndOctave / 12) | 0,
    cents: 1200 * Math.log2(hz / nearestNoteHz),
  };

  return result;
};

export const noteToFrequency = (semitonesFromConcertA: number) => {
  return CONCERT_PITCH * Math.pow(2, semitonesFromConcertA / 12);
};

const isPitchEvent = (e: AudioRecorderEventTypes): e is AudioPitchEvent =>
  e.type === "pitch";

export const activeNote$ = (
  pitches$: Observable<AudioRecorderEventTypes>
): Observable<AnalyzedNote> => {
  return pitches$.pipe(
    filter$<AudioRecorderEventTypes, AudioPitchEvent>(isPitchEvent),
    map$((e) => frequencyToNearestNote(e.pitch.frequency))
  );
};
