import { Observable } from "rxjs";

export const expectEvents$ = <T>(
  source$: Observable<T>,
  expected: T[],
  done: jest.DoneCallback,
  filter: (e: T) => boolean = () => true
) => {
  const events: T[] = [];

  source$.subscribe(
    (event) => {
      if (!filter(event)) return;

      expect(event).toEqual(expected[events.length]);

      events.push(event);

      if (events.length === expected.length) {
        done();
      }
    },
    undefined,
    () => done()
  );
};
