import { Value, Primitive } from "./values";
import type { LiveMap, LiveList, LiveCounter } from "./values";
import { ObjectMetadata, EntryMetadata } from "./metadata";
import type {
  LiveMapOperations,
  LiveListOperations,
  LiveCounterOperations,
  AnyOperations,
} from "./operations";
import type {
  LiveMapInstance,
  LiveListInstance,
  LiveCounterInstance,
  AnyInstance,
} from "./instances";
import type { Subscribable } from "./subscriptions";

// Runtime type assertion methods that can check the underlying value at
// at an entry at runtime and throw an error if it is not the expected type.
// This is possible for nested objects since the object ID includes the type
// of the object, so the type can be determined even if the object instance
// can't (yet) be resolved.
interface PathObjectRuntimeTypeAssertions {
  asLiveMap<T extends Record<string, Value>>(): PathObject<LiveMap<T>>;
  asLiveList<T extends Value>(): PathObject<LiveList<T>>;
  asLiveCounter(): PathObject<LiveCounter>;
  asPrimitive<T extends Primitive>(): T;
}

// Collection types support obtaining a PathObject with a fully-qualified string path,
// which is evaluated from the current path.
// Using this method loses rich compile-time type information.
interface PathObjectCollectionMethods {
  at<T extends Value = Value>(path: string): PathObject<T>;
}

// PathObjectBase defines the set of common methods on a PathObject
// that are present regardless of the underlying type, which specified
// in type parameter T.
interface PathObjectBase<T extends Value> extends Subscribable<T> {
  // the fully-qualified string path that this PathObject represents
  path(): string;

  objectMetadata(): ObjectMetadata | undefined;
  entryMetadata(): EntryMetadata | undefined;

  compact(): any;
}

interface LiveMapPathObjectCollectionMethods<
  T extends Record<string, Value> = Record<string, Value>,
> {
  entries(): IterableIterator<[keyof T, PathObject<T[keyof T]>]>;
  keys(): IterableIterator<keyof T>;
  values(): IterableIterator<PathObject<T[keyof T]>>;
  size(): number;
}

export interface LiveMapPathObject<
  T extends Record<string, Value> = Record<string, Value>,
> extends PathObjectBase<LiveMap<T>>,
    LiveMapPathObjectCollectionMethods<T>,
    // if the underlying instance at a path cannot be resolved
    // when an operation method is invoked, it will throw.
    LiveMapOperations<T>,
    PathObjectCollectionMethods,
    PathObjectRuntimeTypeAssertions {
  // Navigate to a child path within the collection by obtaining a PathObject for that path.
  // The next path segment in a LiveMap is identified with a string key.
  get<K extends keyof T>(key: K): PathObject<T[K]>;

  // Obtain the specific instance currently at this path.
  // If the path does not resolve to any specific instance, returns `undefined`.
  instance(): LiveMapInstance<T> | undefined;
}

interface LiveListPathObjectCollectionMethods<T extends Value = Value> {
  entries(): IterableIterator<PathObject<T>>;
  length(): number;
}

export interface LiveListPathObject<T extends Value = Value>
  extends PathObjectBase<LiveList<T>>,
    LiveListPathObjectCollectionMethods<T>,
    // if the underlying instance at a path cannot be resolved
    // when an operation method is invoked, it will throw.
    LiveListOperations<T>,
    PathObjectCollectionMethods,
    PathObjectRuntimeTypeAssertions {
  // Navigate to a child path within the collection by obtaining a PathObject for that path.
  // The next path segment in a LiveList is identified with a number index.
  get(index: number): PathObject<T>;

  // Obtain the specific instance currently at this path.
  // If the path does not resolve to any specific instance, returns `undefined`.
  instance(): LiveListInstance<T> | undefined;
}

export interface LiveCounterPathObject
  extends PathObjectBase<LiveCounter>,
    // if the underlying instance at a path cannot be resolved
    // when an operation method is invoked, it will throw.
    LiveCounterOperations,
    PathObjectRuntimeTypeAssertions {
  // Get the current value of the counter instance currently at this path.
  // If the path does not resolve to any specific instance, returns `undefined`.
  value(): number | undefined;

  // Obtain the specific instance currently at this path.
  // If the path does not resolve to any specific instance, returns `undefined`.
  instance(): LiveCounterInstance | undefined;
}

export interface PrimitivePathObject<T extends Primitive = Primitive>
  extends PathObjectBase<Primitive>,
    PathObjectRuntimeTypeAssertions {
  // Get the current value of the primitive currently at this path.
  // If the path does not resolve to any specific entry, returns `undefined`.
  value(): T | undefined;
}

interface AnyPathObjectCollectionMethods {
  // LiveMap collection methods
  entries<T extends Record<string, Value>>(): IterableIterator<
    [keyof T, T[keyof T]]
  >;
  keys<T extends Record<string, Value>>(): IterableIterator<keyof T>;
  values<T extends Record<string, Value>>(): IterableIterator<
    PathObject<T[keyof T]>
  >;
  size(): number;

  // LiveList collection methods
  entries<T extends PathObject<Value>>(): IterableIterator<T>;
  length(): number;
}

// When the underlying type of a PathObject is not known, provide a type
// which defines all possible methods. The methods individually support type
// parameters for specifying the expected underlying type.
export interface AnyPathObject<T extends Value = Value>
  extends PathObjectBase<T>,
    AnyOperations,
    AnyPathObjectCollectionMethods,
    PathObjectRuntimeTypeAssertions {
  // Navigate to a child path within the collection by obtaining a PathObject for that path.
  // The next path segment in a collection is identified with a string key or number index.
  get<T extends Value = Value>(keyOrIndex: string | number): PathObject<T>;

  // Obtain the specific instance currently at this path.
  // If the path does not resolve to any specific instance, returns `undefined`.
  instance<T extends Value = Value>(): AnyInstance<T> | undefined;

  // Get the current value of the LiveCounter or primitive currently at this path.
  // If the path does not resolve to any specific entry, returns `undefined`.
  value<T extends number | Primitive = number | Primitive>(): T | undefined;
}

// PathObject wraps a reference to a path from root object on a channel.
// The type parameter specifies the underlying type defined at that path,
// and is used to infer the correct set of methods available for that type.
export type PathObject<T extends Value = Value> = [T] extends [LiveMap<infer T>]
  ? LiveMapPathObject<T>
  : [T] extends [LiveList<infer T>]
    ? LiveListPathObject<T>
    : [T] extends [LiveCounter]
      ? LiveCounterPathObject
      : [T] extends [Primitive]
        ? PrimitivePathObject<T>
        : AnyPathObject<T>;
