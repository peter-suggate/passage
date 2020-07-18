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

export type NearestNote = {
  value: Note;
  octave: number;
  cents: number;
};

export const frequencyToNearestNote = (
  hz: number,
  concertPitch = CONCERT_PITCH
): NearestNote => {
  const nearestNote = Math.round(12 * Math.log2(hz / concertPitch));
  const noteAndOctave = CONCERT_A_HALFTONE_INDEX + nearestNote;
  const nearestNoteHz = concertPitch * Math.pow(2, nearestNote / 12);

  const result = {
    value: NOTES[noteAndOctave % 12],
    octave: Math.round(noteAndOctave / 12) | 0,
    cents: 1200 * Math.log2(hz / nearestNoteHz),
  };

  // console.log("result", result, "hz", hz, "nearestNoteHz", nearestNoteHz);
  return result;
};

export const noteToFrequency = (semitonesFromConcertA: number) => {
  return CONCERT_PITCH * Math.pow(2, semitonesFromConcertA / 12);
};

const isPitchEvent = (e: AudioRecorderEventTypes): e is AudioPitchEvent =>
  e.type === "pitch";

export const activeNote$ = (
  pitches$: Observable<AudioRecorderEventTypes>
): Observable<NearestNote> => {
  return pitches$.pipe(
    filter$<AudioRecorderEventTypes, AudioPitchEvent>(isPitchEvent),
    map$((e) => frequencyToNearestNote(e.pitch.frequency))
  );
};
