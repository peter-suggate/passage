import { Either } from "fp-ts/lib/Either";
import { Option } from "fp-ts/lib/Option";

export function requireSome<A>(input: Option<A>): A {
  if (input._tag === "None") throw Error();
  return input.value;
}

export function match<T, L, R>(
  input: Either<L, R>,
  left: (left: L) => T,
  right: (right: R) => T
) {
  switch (input._tag) {
    case "Left":
      return left(input.left);
    case "Right":
      return right(input.right);
  }
}

export function requireLeft<L, R>(input: Either<L, R>): L {
  switch (input._tag) {
    case "Left":
      return input.left;
    case "Right":
      throw Error(
        `Error returning left of Either because it holds a value in right: ${input.right}`
      );
  }
}

export function requireRight<L, R>(input: Either<L, R>): R {
  switch (input._tag) {
    case "Left":
      throw Error(
        `Error returning right of Either because it holds a value in left: ${input.left}`
      );
    case "Right":
      return input.right;
  }
}
