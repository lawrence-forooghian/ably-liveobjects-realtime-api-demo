// Runtime type assertion methods that can check the underlying value at
// at an entry at runtime and throw an error if it is not the expected type.
// This is possible for nested objects since the object ID includes the type
// of the object, so the type can be determined even if the object instance
// can't (yet) be resolved.
public protocol PathObjectRuntimeTypeAssertions {
    func asLiveMap() throws -> any LiveMapPathObject
    func asLiveList() throws -> any LiveListPathObject
    func asLiveCounter() throws -> any LiveCounterPathObject
    func asPrimitive() throws -> Primitive
}

// Collection types support obtaining a PathObject with a fully-qualified string path,
// which is evaluated from the current path.
// Using this method loses rich compile-time type information.
public protocol PathObjectCollectionMethods {
    // Lawrence: note that in Swift there's not a whole lot of difference between using this or using UnionPathObject's get(key:) / get (at:), because in TS the latter two give you static type information that this doesn't, but in Swift none of them give you static type information
    func at(path: String) -> any UnionPathObject
}

// PathObjectBase defines the set of common methods on a PathObject
// that are present regardless of the underlying type, which specified
// in type parameter T.
public protocol PathObjectBase<EventData>: Subscribable {
    // the fully-qualified string path that this PathObject represents
    var path: String { get }

    var objectMetadata: ObjectMetadata? { get }
    var entryMetadata: EntryMetadata? { get }

    // Lawrence: what is this?
    // compact(): any;
}

// Lawrence: it's unclear to me now at what point the throws happens on the various accessors; I guess it's no longer on the things that just return another path?

public protocol LiveMapPathObjectCollectionMethods {
    var entries: [(key: String, value: any UnionPathObject)] { get }
    var keys: [String] { get }
    var values: [any UnionPathObject] { get }
    var size: Int { get }
}

public protocol LiveMapPathObject:
    PathObjectBase<LiveMapEventData>,
    LiveMapPathObjectCollectionMethods,
    PathObjectCollectionMethods,
    PathObjectRuntimeTypeAssertions,
    // if the underlying instance at a path cannot be resolved
    // when an operation method is invoked, it will throw.
    LiveMapOperations,
    PathObjectCollectionMethods,
    PathObjectRuntimeTypeAssertions
{
    // Navigate to a child path within the collection by obtaining a PathObject for that path.
    // The next path segment in a LiveMap is identified with a string key.
    func get(key: String) -> any UnionPathObject

    // Lawrence: can this throw if it's not a LiveMap at that path?
    // Obtain the specific instance currently at this path.
    // If the path does not resolve to any specific instance, returns `undefined`.
    var instance: (any LiveMapInstance)? { get }
}

public protocol LiveListPathObjectCollectionMethods {
    var entries: [any UnionPathObject] { get }
    var length: Int { get }
}

public protocol LiveListPathObject:
    PathObjectBase<LiveListEventData>,
    LiveListPathObjectCollectionMethods,
    // if the underlying instance at a path cannot be resolved
    // when an operation method is invoked, it will throw.
    LiveListOperations,
    PathObjectCollectionMethods,
    PathObjectRuntimeTypeAssertions
{
    // Navigate to a child path within the collection by obtaining a PathObject for that path.
    // The next path segment in a LiveList is identified with a number index.
    func get(at: Int) -> any UnionPathObject

    // Lawrence: ditto re throwing
    // Obtain the specific instance currently at this path.
    // If the path does not resolve to any specific instance, returns `undefined`.
    var instance: (any LiveListInstance)? { get }
}

public protocol LiveCounterPathObject:
    PathObjectBase<LiveCounterEventData>,
    // if the underlying instance at a path cannot be resolved
    // when an operation method is invoked, it will throw.
    LiveCounterOperations,
    PathObjectRuntimeTypeAssertions
{
    // Lawrence: unclear to me whether this throws or not (the "returns undefined" seems to contradict the comment above LiveCounterOperations conformance; unless there's meant to be some distinction in how we treat read and write operations?)
    // Get the current value of the counter instance currently at this path.
    // If the path does not resolve to any specific instance, returns `undefined`.
    var value: Double? { get }

    // Obtain the specific instance currently at this path.
    // If the path does not resolve to any specific instance, returns `undefined`.
    var instance: (any LiveCounterInstance)? { get }
}

// Lawrence: we probably aren't going to have "extends Primitive" so we can't do the static return type for `encoding`; I initially considered unrolling Primitive's cases into different generic type arguments but decided just to make the method always available but return nil if not string-or-buffer
public protocol PrimitivePathObject:
    PathObjectBase<Primitive>,
    PathObjectRuntimeTypeAssertions
{
    // Get the current value of the primitive currently at this path.
    // If the path does not resolve to any specific entry, returns `undefined`.
    var value: Primitive? { get }

    // Obtain the client-supplied encoding that was specified when this entry was set.
    // Only available for string and buffer primitives.
    //  encoding: T extends string | Buffer ? () => string | undefined : never;
    var encoding: String? { get }
}

public protocol UnionPathObjectCollectionMethods {
    // LiveMap collection methods
    var entries: [(key: String, value: any UnionPathObject)] { get }
    var keys: [String] { get }
    var values: [any UnionPathObject] { get }
    var size: Int { get }

    // LiveList collection methods
    // Lawrence: renamed because of clash, not sure how this works in TS
    var listEntries: [any UnionPathObject] { get }
    var length: Int { get }
}

// When the underlying type of a PathObject is not known, provide a type
// which defines all possible methods. The methods individually support type
// parameters for specifying the expected underlying type.
public protocol UnionPathObject:
    PathObjectBase<UnionEventData>,
    UnionOperations,
    UnionPathObjectCollectionMethods,
    PathObjectRuntimeTypeAssertions
{
    // Navigate to a child path within the collection by obtaining a PathObject for that path.
    // The next path segment in a collection is identified with a string key or number index.
    func get(key: String) -> any UnionPathObject
    func get(at index: Int) -> any UnionPathObject

    // Obtain the specific instance currently at this path.
    // If the path does not resolve to any specific instance, returns `undefined`.
    var instance: (any UnionInstance)? { get }

    // Get the current value of the LiveCounter or primitive currently at this path.
    // If the path does not resolve to any specific entry, returns `undefined`.
    var value: Primitive? { get }
}
