# Components / libraries

# Analysis

## Detection of trouble spots

Pitches since last trouble spot => Nearest notes => buffer last 5 seconds worth of notes => accumulate pitch error over whole 5 seconds + pitch error over last 1 second => if 1-second-error < 5-second-error - threshold, emit trouble spot.

## Piece state

context:

- `troubleSpots[]`
- `currentTroubleSpot: TroubleSpot | undefined`

states:

- `listening`
  - invokes the trouble spot detector Observable which emits `TROUBLE_SPOT_FOUND` events
  - invokes the in-trouble-spot detector which takes the array of trouble spots
- `inTroubleSpot` - invokes troubleSpotService passing in troubleSpot state

events:

- `FINISHED` - user started playing something else or exited => return to parent machine
- `PIECE_ENDED` - user got to the end. Re-enter `listening` state.
- `TROUBLE_SPOT_FOUND` - inserts trouble spot into collection. emits troubleSpotAdded event to detector subject.

## Touble spot state

```ts
type Run = { nearestNotes: NearestNote[] };
```

context:

```ts
type Context = {
  notes: Note[];
  completedRuns: Run[];
  currentRun: Run;
  endSection$: Observable<boolean>; // User stops playing or 3+ notes beyond trouble-spot end played.
};
```

states:

- `listening` - entry: initialize new current run.

events:

- `NOTE_ADDED` -
- `LAST_NOTE_PLAYED` - re-enter `listening` state

### Ideas

- Find recommended etudes that have similar note patterns / rhythm?

# Music display

## Section

Goal: Given a sequence of notes that are deemed trouble spots, find this within the context of the piece and display it's music (annotated) to the user.

- Retrieve index of section's first note.
  - Edit distance of section vs piece.
  - Trace back to find start note index.
- In MusicXML:
  - Find note by index
  - Look back to nearest bar line?
  - Find section end by note index (plus a few extra due to approximate match and extend to next bar line?)
- Add MusicXML notes to canvas/SVG w/ VexFlow

### Annotating a section

MusicXML

## MusicXML

Convert MusicXML => Note[]
