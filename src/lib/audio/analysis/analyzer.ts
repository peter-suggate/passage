import { AudioRecorderEventTypes } from "../recorder";
import { partition, PartialObserver } from "rxjs";
import { AudioRecorderNode } from "../recorder/webaudio/AudioRecorderNode";
import { AudioSynthesizer } from "../recorder/synthaudio/AudioSynthesizer";
import { withLatestFrom, scan, map } from "rxjs/operators";
import { cast } from "@/lib/testing/partial-impl";
import { AudioPitchEvent, AudioOnsetEvent } from "../audio-types";
import { frequencyToNearestNote } from "./nearestNote";
import { Note } from "@/lib/scales";

type PartitionedEvents = [AudioRecorderEventTypes, AudioRecorderEventTypes];

const takeLast = (N = 15) =>
  scan<PartitionedEvents, PartitionedEvents[]>((acc, curr) => {
    acc.push(curr);

    if (acc.length > N) {
      acc.shift();
    }

    return acc;
  }, []);

const median = () =>
  map((arr: PartitionedEvents[]) => {
    arr
      .slice()
      .sort(
        (a, b) =>
          cast<AudioPitchEvent>(a[0]).pitch.frequency -
          cast<AudioPitchEvent>(b[0]).pitch.frequency
      );

    // const HALF_AVERAGE_WINDOW = 5;
    // const middle = arr.length / 2 | 0;
    // const startIndex = middle - HALF_AVERAGE_WINDOW;
    // const endIndex = middle + HALF_AVERAGE_WINDOW;
    // return arr.slice(startIndex, endIndex).reduce((acc, curr) => acc + curr, arr[0]);
    // console.log(
    //   arr.map((a) => cast<AudioPitchEvent>(a[0]).pitch.frequency)
    // );
    return arr[(arr.length / 2) | 0];
  });

const nearestNote = () =>
  map<
    PartitionedEvents,
    {
      clarity: number;
      age: number;
      value: Note;
      octave: number;
      cents: number;
    }
  >(([p, onset]) => {
    const { pitch } = cast<AudioPitchEvent>(p);
    const { t } = cast<AudioOnsetEvent>(onset);
    return {
      ...frequencyToNearestNote(pitch.frequency),
      clarity: pitch.clarity,
      age: pitch.t - t,
    };
  });

export const analyzer$ = (
  analyzerEvents$?: AudioRecorderNode | AudioSynthesizer
) => {
  const [onsets$, pitches$] = partition(
    analyzerEvents$!,
    (e) => e.type === "onset"
  );

  return pitches$.pipe(
    withLatestFrom(onsets$),
    takeLast(15),
    median(),
    nearestNote()
  );
};
