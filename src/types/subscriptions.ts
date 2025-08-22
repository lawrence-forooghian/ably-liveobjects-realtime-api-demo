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

// Options that can be provided to the subscribe and subscribeIterator methods.
export interface SubscriptionOptions {
  // Number of levels deep on which to listen for changes in nested children.
  // If `undefined`, does not impose a depth limit (i.e. listens for changes
  // to all nested children at any depth)
  depth?: number;
}
