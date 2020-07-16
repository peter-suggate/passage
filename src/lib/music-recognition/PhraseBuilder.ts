import { integer, Integer, Note, PosInteger, NOTES } from "../scales";
import { noteDeltas } from "./noteDeltas";

const d = (note: Note, octave = integer(0)) =>
  integer(NOTES.indexOf(note) + octave * 12);

export const PhraseBuilder = () => {
  let _octave = integer(0);
  const _notes: Integer[] = [];

  return {
    up: function(octaves = integer(1)) {
      _octave = integer(_octave + octaves);

      return this;
    },

    down: function(octaves = integer(1)) {
      _octave = integer(_octave - octaves);

      return this;
    },

    push: function(...notes: Note[]) {
      notes.forEach((note) => _notes.push(d(note, _octave)));

      return this;
    },

    repeat: function(times: PosInteger, ...notes: Note[]) {
      new Array(times).fill(0).forEach(() => {
        notes.forEach((note) => _notes.push(d(note, _octave)));
      });

      return this;
    },

    get noteDeltas() {
      return noteDeltas(_notes);
    },
  };
};
