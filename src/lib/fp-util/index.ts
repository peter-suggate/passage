import { tryCatch, TaskEither } from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { left, right, map } from "fp-ts/lib/Either";
import {
  fromEither as taskfromEither,
  map as mapTask,
  mapLeft as mapTaskLeft,
  chain as chainTask,
  right as taskRight
} from "fp-ts/lib/TaskEither";

export const tap = <E, A>(onOk: (a: A) => void) => (arg: A) =>
  pipe(
    // left(err => { onErr && onErr(err); return err; }),
    right(onOk(arg)), // Run the side effect, e.g. logging
    map(() => arg) // Forward the original value.
  );

export const tapTask = <E, A>(onOk: (a: A) => void, onErr?: (e: E) => void) => (
  te: TaskEither<E, A>
) =>
  pipe(
    te,
    mapTaskLeft(err => {
      onErr && onErr(err); // Run an optional error effect.
      return err;
    }),
    chainTask(arg => {
      onOk(arg); // Run the side effect.
      return te; // Forward the original value.
    })
  );

export const taskFromAsync = <T>(asyncFn: () => Promise<T>) =>
  tryCatch<Error, T>(asyncFn, e => e as Error);

// export const mapTaskFromAsyncWith = <T, U>(
//   asyncFn: (input: unknown) => Promise<T>,
//   prepareResult: (result: T, input: unknown) => U
// ) =>
//   chainTask((input) =>
//     pipe(
//       taskFromAsync(() => asyncFn(input)),
//       mapTask((result) => prepareResult(result, input))
//     )
//   );

// export const mapTaskWith = <T, U>(
//   fn: () => T,
//   prepareResult: (result: T, input: unknown) => U
// ) =>
//   chainTask((input) =>
//     pipe(
//       taskRight<Error, T>(fn()),
//       mapTask((result) => prepareResult(result, input))
//     )
//   );

export { pipe, taskfromEither, mapTask, chainTask, taskRight, right, left };
