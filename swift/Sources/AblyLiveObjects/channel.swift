// The type returned by `client.channels.get()` in the Ably Realtime client
public protocol Channel: Sendable {
    var object: RealtimeObjectProtocol { get }
}

// Lawrence: Added for Swift; this is what's returned by `channel.object`.
public protocol RealtimeObjectProtocol {
    // TODO: is `get` a great name for this? It's a keyword in Swift in certain circumstances
    func get() async throws -> any LiveMapPathObject
    func on(_ event: RealtimeObjectEvent, callback: @escaping () -> Void)
}

public enum RealtimeObjectEvent {
    case syncing
    case synced
}
