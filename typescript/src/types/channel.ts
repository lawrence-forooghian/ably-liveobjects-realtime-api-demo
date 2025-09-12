import { Value } from "./values";
import { LiveMap } from "./values";
import { PathObject } from "./pathobjects";

// The type returned by `client.channels.get()` in the Ably Realtime client
export interface Channel {
  object: {
    get<T extends Record<string, Value>>(): Promise<PathObject<LiveMap<T>>>;
    on(event: "syncing" | "synced", callback: () => void): void;
    off(event: "syncing" | "synced", callback?: Function): void;
  };
}
