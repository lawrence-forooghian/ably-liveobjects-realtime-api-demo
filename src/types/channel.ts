import { Value } from "./values";
import { LiveMap } from "./values";
import { PathObject } from "./pathobjects";

// The type returned by `client.channels.get()` in the Ably Realtime client
export interface Channel {
  object: {
    get<T extends Record<string, Value>>(): Promise<PathObject<LiveMap<T>>>;
    on(event: "syncing" | "synced", callback: () => void): void;
    on(event: "deleted", callback: (objectId: string) => void): void;
    off(event: "syncing" | "synced" | "deleted", callback?: Function): void;
  };
}
