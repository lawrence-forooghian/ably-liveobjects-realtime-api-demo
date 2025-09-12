// Object-level metadata.
// Metadata for specific LiveObject types is nested under the appropriate key.
public protocol ObjectMetadata {
    var objectId: String { get }
    var siteTimeserials: [String: String] { get }
    var tombstone: Bool { get }
    // Lawrence: probably would have a separate type for this, not important now
    //  map?: {
//    semantics: "LWW";
    //  };
}

// Entry-level metadata on entries in collection types.
public protocol EntryMetadata {
    var timeserial: String { get }
    var tombstone: Bool { get }
}
