import { Observable } from "rxjs";

export const expectEvents$ = <T, U = T>(
  source$: Observable<T>,
  expected: Partial<U>[] | U[],
  done: jest.DoneCallback,
  filter?: (e: T) => boolean,
  transform?: <U>(e: T) => unknown
) => {
  if (expected.length === 0) {
    throw Error(
      "expectEvents$() requires one or more expected events but received an empty array."
    );
  }

  const events: T[] = [];

  source$.subscribe(
    (event) => {
      if (filter && !filter(event)) return;

      if (transform) {
        expect(transform(event)).toEqual(expected[events.length]);
      } else {
        expect(event).toMatchObject(expected[events.length]);
      }

      events.push(event);

      if (events.length === expected.length) {
        done();
      }
    },
    undefined,
    () => done()
  );
};

export const allEvents$ = <T>(
  source$: Observable<T>,
  callback: (events: T[]) => void,
  done: jest.DoneCallback
) => {
  const events: T[] = [];

  source$.subscribe(
    (event) => {
      events.push(event);
    },
    undefined,
    () => {
      callback(events);
      done();
    }
  );
};

// Make expectations on events originating from xstate service state changes.
export const expectServiceEvents$ = <T extends { value: string }>(
  source$: Observable<T>,
  expected: Partial<T>[],
  done: jest.DoneCallback,
  matchOn: (e: T) => Pick<T, "value"> = (e: T) => ({ value: e.value }),
  filter: (e: T) => boolean = () => true
) => {
  const events: T[] = [];

  source$.subscribe(
    (event) => {
      if (!filter(event)) return;

      expect(matchOn(event)).toEqual(expected[events.length]);

      events.push(event);

      if (events.length === expected.length) {
        done();
      }
    },
    undefined,
    () => done()
  );
};
