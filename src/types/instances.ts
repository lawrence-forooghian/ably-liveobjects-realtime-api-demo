import { Value, Primitive } from "./values";
import type { LiveMap, LiveList, LiveCounter } from "./values";
import { ObjectMetadata, EntryMetadata } from "./metadata";
import type {
  LiveMapOperations,
  LiveListOperations,
  LiveCounterOperations,
  AnyOperations,
} from "./operations";
import type { Subscribable, ObjectMessage } from "./subscriptions";

// The type of the argument passed to the subscription callback.
export type InstanceSubscriptionEvent<T extends Value> = {
  object: Instance<T>;
  message: ObjectMessage;
};

// Runtime type assertion methods that can check the underlying value at
// at an entry at runtime and throw an error if it is not the expected type.
// This is possible for nested objects since the object ID includes the type
// of the object, so the type can be determined even if the object instance
// can't (yet) be resolved.
interface InstanceRuntimeTypeAssertions {
  asLiveMap<T extends Record<string, Value>>(): Instance<LiveMap<T>>;
  asLiveList<T extends Value>(): Instance<LiveList<T>>;
  asLiveCounter(): Instance<LiveCounter>;
  asPrimitive<T extends Primitive>(): T;
}

// InstanceBase defines the set of common methods on an Instance
// that are present regardless of the underlying type, which specified
// in type parameter T.
interface InstanceBase<T extends Value> extends Subscribable<T> {
  // the object ID of this instance
  id(): string;

  objectMetadata(): ObjectMetadata | undefined;
  entryMetadata(): EntryMetadata | undefined;

  compact(): any;
}

interface LiveMapInstanceCollectionMethods<
  T extends Record<string, Value> = Record<string, Value>,
> {
  entries(): IterableIterator<[keyof T, Instance<T[keyof T]>]>;
  keys(): IterableIterator<keyof T>;
  values(): IterableIterator<Instance<T[keyof T]>>;
  size(): number;
}

export interface LiveMapInstance<
  T extends Record<string, Value> = Record<string, Value>,
> extends InstanceBase<LiveMap<T>>,
    LiveMapOperations<T>,
    LiveMapInstanceCollectionMethods<T>,
    InstanceRuntimeTypeAssertions {
  // Navigate to a child object within the collection by obtaining the instance at that entry.
  // The entry in a LiveMap is identified with a string key.
  // If not such entry exists, or if the referenced object cannot be resolved, returns `undefined`.
  get<K extends keyof T>(key: K): Instance<T[K]> | undefined;
}

interface LiveListInstanceCollectionMethods<T extends Value = Value> {
  entries(): IterableIterator<Instance<T>>;
  length(): number;
}

export interface LiveListInstance<T extends Value = Value>
  extends InstanceBase<LiveList<T>>,
    LiveListOperations<T>,
    LiveListInstanceCollectionMethods<T>,
    InstanceRuntimeTypeAssertions {
  // Navigate to a child object within the collection by obtaining the instance at that entry.
  // The entry in a LiveList is identified with a number index.
  // If not such entry exists, or if the referenced object cannot be resolved, returns `undefined`.
  get(index: number): Instance<T> | undefined;
}

export interface LiveCounterInstance
  extends InstanceBase<LiveCounter>,
    LiveCounterOperations,
    InstanceRuntimeTypeAssertions {
  // Get the current value of the counter instance.
  value(): number;
}

export interface PrimitiveInstance<T extends Primitive = Primitive>
  extends InstanceBase<Primitive>,
    InstanceRuntimeTypeAssertions {
  // Get the current value of the primitive currently at this entry.
  value(): T;
}

interface AnyInstanceCollectionMethods {
  // LiveMap collection methods
  entries<
    T extends Value,
    U extends [string, Instance<T>] | Instance<T>,
  >(): IterableIterator<U>;
  keys<T extends Record<string, Value>>(): IterableIterator<keyof T>;
  values<T extends Record<string, Value>>(): IterableIterator<
    Instance<T[keyof T]>
  >;
  size(): number;

  // LiveList collection methods
  entries<T extends Instance<Value>>(): IterableIterator<T>;
  length(): number;
}

export interface AnyInstance<T extends Value>
  extends InstanceBase<T>,
    AnyOperations,
    AnyInstanceCollectionMethods,
    InstanceRuntimeTypeAssertions {
  // Navigate to a child object within the collection by obtaining the instance at that entry.
  // The entry in a collection is identified with a string key or number index.
  get<T extends Value = Value>(keyOrIndex: string | number): Instance<T>;

  // Get the current value of the LiveCounter or primitive currently at this entry.
  // If the entry does not exist, returns `undefined`.
  value<T extends number | Primitive = number | Primitive>(): T | undefined;
}

// Instance wraps a specific object instance or entry in a specific collection
// object instance.
// The type parameter specifies the underlying type of the instance,
// and is used to infer the correct set of methods available for that type.
export type Instance<T extends Value> = [T] extends [LiveMap<infer T>]
  ? LiveMapInstance<T>
  : [T] extends [LiveList<infer T>]
    ? LiveListInstance<T>
    : [T] extends [LiveCounter]
      ? LiveCounterInstance
      : [T] extends [Primitive]
        ? PrimitiveInstance<T>
        : AnyInstance<T>;
