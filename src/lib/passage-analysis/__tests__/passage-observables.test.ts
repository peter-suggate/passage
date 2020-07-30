import { from } from 'rxjs';
import { troubleSpot$, seconds } from "../passage-observables";
import { Note, posInteger } from '@/lib/scales';
import { AnalyzedNote } from '@/lib/audio/analysis';

const makeNote = (
    value: Note = "A",
    t = 0,
    cents = 0,
    clarity = 0.9
  ): AnalyzedNote => ({
    age: t,
    cents,
    clarity,
    octave: 4,
    t,
    value,
  });
  
describe('observable that emits non-overlapping "trouble" sections within a larger passage', () => {
    // const n = makeNote;

    const sequence = (...noteQualities: (0 | 1)[]) => {
        return noteQualities.map((quality, index) => makeNote('C', index, quality === 1 ? 0 : 20));
    };

    // const Good = n('C');
    // const Poor = n('C');
    // const D = n('D');
    // const E = n('E');

    it('emits none when there are no low quality notes', async () => {
        expect(
            await troubleSpot$(from(sequence(1,1,1,1,1)), {
                maxLengthSecs: seconds(5),
                minNotes: posInteger(3)
            }).toPromise()
        ).toBeUndefined();
    });

    it('emits none when insufficient notes are low quality', async () => {
        expect(
            await troubleSpot$(from(sequence(1,1,1,0,0,1)), {
                minNotes: posInteger(3)
            }).toPromise()
        ).toBeUndefined();
    });

    it('emits trouble spot at beginning', async () => {

    });

    it('emits trouble spot at end', async () => {

    });
});
