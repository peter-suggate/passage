/**
 * Generator for opaque types to allow type-safe nominal types.
 *
 * @example type Fraction = Opaque<"Fraction", number>;
 */
export type Opaque<K, T> = T & { __TYPE__: K };
