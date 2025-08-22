// Object-level metadata.
// Metadata for specific LiveObject types is nested under the appropriate key.
export interface ObjectMetadata {
  objectId: string;
  siteTimeserials: Record<string, string>;
  tombstone: boolean;
  map?: {
    semantics: "LWW";
  };
}

// Entry-level metadata on entries in collection types.
export interface EntryMetadata {
  timeserial: string;
  tombstone: boolean;
}
