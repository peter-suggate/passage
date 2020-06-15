import { Observable } from "rxjs";
import { map as map$, filter as filter$ } from "rxjs/operators";
import { AudioRecorderEventTypes } from "../recorder";
import { AudioPitchEvent } from "../audio-types";

export type Notes =
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

const notes: Notes[] = [
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

export const frequencyToNote = (freq: number, concertPitch = 440.0) => {
  const noteAndOctave = 69 + Math.round(12 * Math.log2(freq / concertPitch));

  return notes[noteAndOctave % 12];
};

const isPitchEvent = (e: AudioRecorderEventTypes): e is AudioPitchEvent =>
  e.type === "pitch";

export const activeNote$ = (
  pitches$: Observable<AudioRecorderEventTypes>
): Observable<Notes> => {
  return pitches$.pipe(
    filter$<AudioRecorderEventTypes, AudioPitchEvent>(isPitchEvent),
    map$((e) => frequencyToNote(e.pitch.frequency))
  );
};
