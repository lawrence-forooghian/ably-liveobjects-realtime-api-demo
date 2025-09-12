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

interface BatchOperation<T extends LiveObject> {
  // Batch multiple operations together using a batch context, which
  // wraps the underlying PathObject or Instance that batch was called from.
  // The batch context always contains a specific resolved instance, even
  // if called from a PathObject. If a specific instance cannot be obtained
  // from the referenced path, batch will throw an error.
  batch(fn: (ctx: BatchContext<T>) => void): Promise<void>;
}

export interface LiveMapOperations<
  T extends Record<string, Value> = Record<string, Value>,
> extends BatchOperation<LiveMap<T>> {
  set<K extends keyof T>(
    key: K,
    value: T[K],
    options?: OperationOptions,
  ): Promise<void>;
  remove(key: keyof T, options?: OperationOptions): Promise<void>;
}

export interface LiveListOperations<T extends Value = Value>
  extends BatchOperation<LiveList<T>> {
  append(value: T, options?: OperationOptions): Promise<void>;
  prepend(value: T, options?: OperationOptions): Promise<void>;
  pop(options?: OperationOptions): Promise<void>;
  shift(options?: OperationOptions): Promise<void>;
  insert(index: number, value: T, options?: OperationOptions): Promise<void>;
  remove(index: number, options?: OperationOptions): Promise<void>;
}

export interface LiveCounterOperations extends BatchOperation<LiveCounter> {
  increment(amount?: number, options?: OperationOptions): Promise<void>;
}

export interface AnyOperations {
  batch<T extends LiveObject = LiveObject>(
    fn: (ctx: BatchContext<T>) => void,
  ): Promise<void>;

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
