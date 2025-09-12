// Primitive types that can be stored in collection types.
// Includes JSON-serialisable data so that maps and lists
// can hold plain JS values.
export type Primitive =
  | string
  | number
  | boolean
  | Buffer
  // JSON-serialisable primitive values
  | { [key: string]: Primitive }
  | Primitive[];

// Unique symbol for nominal typing within TypeScript's structural type system.
// This prevents structural compatibility between LiveObject types.
declare const __livetype: unique symbol;

// Branded interfaces that enables TypeScript to distinguish
// between LiveObject types even when they have identical structure.
// Enables PathObject<T> to dispatch to correct method sets via conditional types.

export interface LiveMap<
  T extends Record<string, Value> = Record<string, Value>,
> {
  [__livetype]: "LiveMap";
}

export interface LiveList<T extends Value = Value> {
  [__livetype]: "LiveList";
}

export interface LiveCounter {
  [__livetype]: "LiveCounter";
}

// Type union that matches any LiveObject type that can be mutated, subscribed to, etc.
export type LiveObject = LiveMap | LiveList | LiveCounter;

// Type union that defines the base set of allowed types that can be stored in collection types.
// Describes the set of all possible values that can parameterize PathObject.
// This is the canonical union used when we cannot infer a narrower type.
export type Value = LiveObject | Primitive;

// LiveObject type class implementations.
// Currently only defines the static method used to create branded value types
// which can be provided as an argument to mutation methods.

export class LiveMap {
  static create<T extends Record<string, Value>>(
    initialData?: T,
  ): LiveMap<T extends Record<string, Value> ? T : {}> {
    return undefined as any;
  }
}

export class LiveList {
  static create<T extends Value>(
    initialData?: T[],
  ): LiveList<T extends Value ? T : Value> {
    return undefined as any;
  }
}

export class LiveCounter {
  static create(initialValue: number = 0): LiveCounter {
    return undefined as any;
  }
}
