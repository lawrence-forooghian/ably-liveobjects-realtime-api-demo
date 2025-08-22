import { Value } from "./values";

// The raw message data from the object message that carried an operation.
export interface ObjectMessage {
  id?: string;
  timestamp: number;
  clientId: string;
  connectionId: string;
  channel: string;
  extras?: {
    headers?: Record<string, string>;
    [key: string]: any;
  };
  serial: number;
  siteCode: string;

  // payload provides a user-friendly representation
  // of the raw operation payload
  payload(): any;
}

// The type of the argument passed to the subscription callback.
export type SubscriptionEvent<T extends Value> = {
  message: ObjectMessage;
};

// Options that can be provided to the subscribe and subscribeIterator methods.
export interface SubscriptionOptions {
  // Number of levels deep on which to listen for changes in nested children.
  // If `undefined`, does not impose a depth limit (i.e. listens for changes
  // to all nested children at any depth)
  depth?: number;
}

export interface Subscribable<T extends Value> {
  // Subscribe to changes to the object.
  //
  // The callback receives a message describing each change operation.
  //
  // Subscriptions observe nested changes by default; configure depth via options.
  //
  // PathObject subscriptions observe whatever value exists at this path.
  // The subscription remains active even when path does not resolve to any
  // location with a value (e.g. if an entry was removed from map).
  // If the object instance that exists at the path changes, the subscription
  // automatically switches to observe changes to the new object instance (and
  // stops observing the old one).
  //
  // Instance subscriptions observe a specific object instance regardless of location.
  // The subscription follows the instance if it moves within the wider structure
  // (e.g. moved between map entries or list positions).
  // If the instance is deleted from the channel object entirely (i.e. it is tombstoned)
  // the subscription is invoked with the corresponding delete operation before
  // automatically terminating.
  subscribe(
    callback: (event: SubscriptionEvent<T>) => void,
    options?: SubscriptionOptions,
  ): () => void;
  subscribeIterator(
    options?: SubscriptionOptions,
  ): AsyncIterableIterator<SubscriptionEvent<T>>;
}
