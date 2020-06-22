import { Observable } from "rxjs";
import { map as map$, filter as filter$ } from "rxjs/operators";
import { AudioRecorderEventTypes } from "../recorder";
import { AudioPitchEvent } from "../audio-types";

export type Note =
  | "A"
  | "A#"
  | "B"
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#";

const notes: Note[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export type NearestNote = {
  value: Note;
  octave: number;
  cents: number;
};

export const frequencyToNearestNote = (
  hz: number,
  concertPitch = 440.0
): NearestNote => {
  const nearestNote = Math.round(12 * Math.log2(hz / concertPitch));
  const noteAndOctave = 69 + nearestNote;
  const nearestNoteHz = concertPitch * Math.pow(2, nearestNote / 12);

  return {
    value: notes[noteAndOctave % 12],
    octave: Math.round(noteAndOctave / 12) | 0,
    cents: 1200 * Math.log2(hz / nearestNoteHz),
  };
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
