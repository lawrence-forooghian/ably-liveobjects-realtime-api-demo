import Foundation

// The raw message data from the object message that carried an operation.
public protocol ObjectMessage {
    var id: String? { get }
    var timestamp: Date { get }
    var clientId: String { get }
    var connectionId: String { get }
    var channel: String { get }
    var extras: Extras? { get }
    var serial: Int { get }
    var siteCode: String { get }
    var encoding: String? { get }

    // TODO: what is this?
    // payload provides a user-friendly representation
    // of the raw operation payload
    func payload() -> Any
}

// The type of the argument passed to the subscription callback.
public protocol SubscriptionEvent<Data> {
    // TODO: what is this used for?
    associatedtype Data

    var message: ObjectMessage { get }
}

// Options that can be provided to the subscribe and subscribeIterator methods.
public struct SubscriptionOptions {
    // Number of levels deep on which to listen for changes in nested children.
    // If `undefined`, does not impose a depth limit (i.e. listens for changes
    // to all nested children at any depth)
    var depth: Int?
}

public protocol Subscribable<EventData> {
    associatedtype EventData

    // Lawrence: Have skipped the unsubscribe mechanism
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
    func subscribe(
        callback: @escaping (any SubscriptionEvent<EventData>) -> Void,
        options: SubscriptionOptions,
    )
    func subscribe(
        callback: @escaping (any SubscriptionEvent<EventData>) -> Void,
    )

    func subscribeAsyncSequence(
        options: SubscriptionOptions,
    ) -> any AsyncSequence<any SubscriptionEvent<EventData>, Never>
    func subscribeAsyncSequence() -> any AsyncSequence<any SubscriptionEvent<EventData>, Never>
}

// TODO: Lawrence — added these because it seems we need them for the generic type parameter of SubscriptionEvent, even though it's not clear how that's being used yet. But I guess the they will have a non-optional type-specific field
public struct LiveMapEventData {}
public struct LiveCounterEventData {}
public struct LiveListEventData {}

/// The specialised event data emitted by a Union type
public enum UnionEventData {
    case liveMap(LiveMapEventData)
    case liveCounter(LiveCounterEventData)
    case liveList(LiveListEventData)
}
