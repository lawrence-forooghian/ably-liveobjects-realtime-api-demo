import { Value } from "./values";
import type { LiveObject, LiveMap, LiveList, LiveCounter } from "./values";
import type { BatchContext } from "./batchcontext";

// Options that can be provided to operation methods which specify
// additional data to include on the published object message(s).
export interface OperationOptions {
  id?: string;
  extras?: {
    headers?: Record<string, string>;
    [key: string]: any;
  };
  encoding?: string;
}

export interface LiveMapOperations<
  T extends Record<string, Value> = Record<string, Value>,
> {
  batch(fn: (ctx: BatchContext<LiveMap<T>>) => void): Promise<void>;

  set<K extends keyof T>(
    key: K,
    value: T[K],
    options?: OperationOptions,
  ): Promise<void>;
  remove(key: keyof T, options?: OperationOptions): Promise<void>;
}

export interface LiveListOperations<T extends Value = Value> {
  batch(fn: (ctx: BatchContext<LiveList<T>>) => void): Promise<void>;

  append(value: T, options?: OperationOptions): Promise<void>;
  prepend(value: T, options?: OperationOptions): Promise<void>;
  pop(options?: OperationOptions): Promise<void>;
  shift(options?: OperationOptions): Promise<void>;
  insert(index: number, value: T, options?: OperationOptions): Promise<void>;
  remove(index: number, options?: OperationOptions): Promise<void>;
}

export interface LiveCounterOperations {
  batch(fn: (ctx: BatchContext<LiveCounter>) => void): Promise<void>;

  increment(amount?: number, options?: OperationOptions): Promise<void>;
}

export interface AnyOperations {
  batch(fn: (ctx: BatchContext<LiveObject>) => void): Promise<void>;

  // LiveMap operations
  set<T extends Record<string, Value> = Record<string, Value>>(
    key: keyof T,
    value: T[keyof T],
    options?: OperationOptions,
  ): Promise<void>;
  remove<T extends Record<string, Value> = Record<string, Value>>(
    key: keyof T,
    options?: OperationOptions,
  ): Promise<void>;

  // LiveList operations
  append<T extends Value = Value>(
    value: T,
    options?: OperationOptions,
  ): Promise<void>;
  prepend<T extends Value = Value>(
    value: T,
    options?: OperationOptions,
  ): Promise<void>;
  pop(options?: OperationOptions): Promise<void>;
  shift(options?: OperationOptions): Promise<void>;
  insert<T extends Value = Value>(
    index: number,
    value: T,
    options?: OperationOptions,
  ): Promise<void>;
  remove<T extends Value = Value>(
    index: number,
    options?: OperationOptions,
  ): Promise<void>;

  // LiveCounter operations
  increment(amount?: number, options?: OperationOptions): Promise<void>;
}

export type BatchOperations<T> = {
  [K in keyof T as K extends "batch" ? never : K]: T[K] extends (
    this: infer This,
    ...args: infer A
  ) => PromiseLike<infer R>
    ? (this: This, ...args: A) => R
    : T[K] extends (this: infer This, ...args: infer A) => infer R
      ? (this: This, ...args: A) => R
      : T[K];
};
