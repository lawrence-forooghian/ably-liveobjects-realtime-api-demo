import { Value } from "./values";
import type { LiveMap, LiveList, LiveCounter, Primitive } from "./values";
import {
  LiveMapOperations,
  LiveListOperations,
  LiveCounterOperations,
  AnyOperations,
} from "./operations";

export interface LiveMapBatchContextCollectionMethods<
  T extends Record<string, Value> = Record<string, Value>,
> {
  entries(): IterableIterator<[keyof T, BatchContext<T[keyof T]>]>;
  keys(): IterableIterator<keyof T>;
  values(): IterableIterator<BatchContext<T[keyof T]>>;
  size(): number;
}

export interface LiveMapBatchContext<
  T extends Record<string, Value> = Record<string, Value>,
> extends BatchOperations<LiveMapOperations<T>>,
    LiveMapBatchContextCollectionMethods<T> {
  // Navigate to a child object within the collection by obtaining the instance at that entry.
  // The entry in a LiveMap is identified with a string key.
  // If not such entry exists, or if the referenced object cannot be resolved, returns `undefined`.
  get<K extends keyof T>(key: K): BatchContext<T[K]> | undefined;
}

export interface LiveListBatchContextCollectionMethods<
  T extends Value = Value,
> {
  entries(): IterableIterator<BatchContext<T>>;
  length(): number;
}

export interface LiveListBatchContext<T extends Value = Value>
  extends BatchOperations<LiveListOperations<T>>,
    LiveListBatchContextCollectionMethods<T> {
  // Navigate to a child object within the collection by obtaining the instance at that entry.
  // The entry in a LiveList is identified with a number index.
  // If not such entry exists, or if the referenced object cannot be resolved, returns `undefined`.
  get(index: number): BatchContext<T> | undefined;
}

export interface LiveCounterBatchContext
  extends BatchOperations<LiveCounterOperations> {
  // Get the current value of the counter instance.
  value(): number;
}

export interface PrimitiveBatchContext<T extends Primitive = Primitive> {
  // Get the current value of the primitive currently at this entry.
  value(): T;
}

// TODO runtime assertions

export interface AnyBatchContext extends BatchOperations<AnyOperations> {}

// BatchOperations makes all operation methods synchronous,
// and removes the `batch` method.
type BatchOperations<T> = {
  [K in keyof T as K extends "batch" ? never : K]: T[K] extends (
    this: infer This,
    ...args: infer A
  ) => PromiseLike<infer R>
    ? (this: This, ...args: A) => R
    : T[K] extends (this: infer This, ...args: infer A) => infer R
      ? (this: This, ...args: A) => R
      : T[K];
};

export type BatchContext<T extends Value> = [T] extends [LiveMap<infer T>]
  ? LiveMapBatchContext<T>
  : [T] extends [LiveList<infer T>]
    ? LiveListBatchContext<T>
    : [T] extends [LiveCounter]
      ? LiveCounterBatchContext
      : [T] extends [Primitive]
        ? PrimitiveBatchContext<T>
        : AnyBatchContext;
