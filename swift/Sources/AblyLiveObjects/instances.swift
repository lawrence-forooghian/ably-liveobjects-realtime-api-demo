// TODO: Lawrence removed InstanceSubscriptionEvent because it seems unused

// Runtime type assertion methods that can check the underlying value at
// at an entry at runtime and throw an error if it is not the expected type.
// This is possible for nested objects since the object ID includes the type
// of the object, so the type can be determined even if the object instance
// can't (yet) be resolved.
public protocol InstanceRuntimeTypeAssertions {
    // TODO: When does the throwing happen?
    func asLiveMap() -> any LiveMapInstance
    func asLiveList() -> any LiveListInstance
    func asLiveCounter() -> any LiveCounterInstance
    func asPrimitive() -> Primitive
}

// InstanceBase defines the set of common methods on an Instance
// that are present regardless of the underlying type, which specified
// in type parameter T.
public protocol InstanceBase<EventData>: Subscribable {
    // TODO: what if the instance is a primitive? then there isn't an ID?
    // the object ID of this instance
    var id: String { get }

    var objectMetadata: ObjectMetadata? { get }
    var entryMetadata: EntryMetadata? { get }

    // TODO: what is this
    // compact(): any;
}

// TODO: as in pathobjects.swift it's unclear to me what can throw but I assume that these ones can

public protocol LiveMapInstanceCollectionMethods {
    var entries: [(key: String, value: any UnionInstance)] { get }
    var keys: [String] { get }
    var values: [any UnionInstance] { get }
    var size: Int { get }
}

public protocol LiveMapInstance:
    InstanceBase<LiveMapEventData>,
    LiveMapOperations,
    LiveMapInstanceCollectionMethods,
    InstanceRuntimeTypeAssertions
{
    // Navigate to a child object within the collection by obtaining the instance at that entry.
    // The entry in a LiveMap is identified with a string key.
    // If not such entry exists, or if the referenced object cannot be resolved, returns `undefined`.
    func get(key: String) -> (any UnionInstance)?
}

public protocol LiveListInstanceCollectionMethods {
    var entries: [any UnionInstance] { get }
    var length: Int { get }
}

public protocol LiveListInstance:
    InstanceBase<LiveListEventData>,
    LiveListOperations,
    LiveListInstanceCollectionMethods,
    InstanceRuntimeTypeAssertions
{
    // Navigate to a child object within the collection by obtaining the instance at that entry.
    // The entry in a LiveList is identified with a number index.
    // If not such entry exists, or if the referenced object cannot be resolved, returns `undefined`.
    func get(at: Int) -> any UnionInstance
}

public protocol LiveCounterInstance:
    InstanceBase<LiveCounterEventData>,
    LiveCounterOperations,
    InstanceRuntimeTypeAssertions
{
    // TODO: what does this "leaf type" thing mean? ditto elsewhere? I thought that once you had an instance, then the type is known
    // Get the current value of the counter instance.
    // Returns undefined if the current instance is not a leaf type.
    var value: Double? { get }
}

// TODO: same question as on PrimitivePathObject re specialising static interface based on Primitive case
public protocol PrimitiveInstance:
    InstanceBase<Primitive>,
    InstanceRuntimeTypeAssertions
{
    // Get the current value of the primitive currently at this entry.
    // Returns undefined if the current instance is not a leaf type.
    var value: Primitive? { get }

    // Obtain the client-supplied encoding that was specified when this entry was set.
    // Only available for string and buffer primitives.
    // encoding: T extends string | Buffer ? () => string | undefined : never;
    var encoding: String? { get }
}

public protocol UnionInstanceCollectionMethods {
    // LiveMap collection methods
    var entries: [(key: String, value: any UnionInstance)] { get }
    var keys: [String] { get }
    var values: [any UnionInstance] { get }
    var size: Int { get }

    // LiveList collection methods
    // TODO: Lawrence renamed because of clash, not sure how this works in TS
    var listEntries: [any UnionInstance] { get }
    var length: Int { get }
}

public protocol UnionInstance:
    InstanceBase<UnionEventData>,
    UnionOperations,
    UnionInstanceCollectionMethods,
    InstanceRuntimeTypeAssertions
{
    // Navigate to a child object within the collection by obtaining the instance at that entry.
    // The entry in a collection is identified with a string key or number index.
    func get(at key: String) -> any UnionInstance
    func get(at index: Int) -> any UnionInstance

    // TODO: Lawrence — check that Primitive is the right thing to do here; the "number | Primitive" in the TS types really just collapses to Primitive AFAIK
    // Get the current value of the LiveCounter or primitive currently at this entry.
    // If the entry does not exist, returns `undefined`.
    var value: Primitive? { get }
}
