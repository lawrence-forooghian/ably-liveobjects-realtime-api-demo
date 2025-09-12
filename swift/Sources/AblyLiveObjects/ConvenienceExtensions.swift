import Foundation

// MARK: - Primitive associated value getters

public extension Primitive {
    /// If this `Primitive` has case `string`, this returns the associated value. Else, it returns `nil`.
    var stringValue: String? {
        if case let .string(value) = self {
            return value
        }
        return nil
    }

    /// If this `Primitive` has case `number`, this returns the associated value. Else, it returns `nil`.
    var numberValue: Double? {
        if case let .number(value) = self {
            return value
        }
        return nil
    }

    /// If this `Primitive` has case `bool`, this returns the associated value. Else, it returns `nil`.
    var boolValue: Bool? {
        if case let .bool(value) = self {
            return value
        }
        return nil
    }

    /// If this `Primitive` has case `data`, this returns the associated value. Else, it returns `nil`.
    var dataValue: Data? {
        if case let .data(value) = self {
            return value
        }
        return nil
    }

    /// If this `Primitive` has case `jsonArray`, this returns the associated value. Else, it returns `nil`.
    var jsonArrayValue: [JSONValue]? {
        if case let .jsonArray(value) = self {
            return value
        }
        return nil
    }

    /// If this `Primitive` has case `jsonObject`, this returns the associated value. Else, it returns `nil`.
    var jsonObjectValue: [String: JSONValue]? {
        if case let .jsonObject(value) = self {
            return value
        }
        return nil
    }
}

// MARK: - ExpressibleBy*Literal conformances

extension Value: ExpressibleByDictionaryLiteral {
    public init(dictionaryLiteral elements: (String, JSONValue)...) {
        self = .primitive(.jsonObject(.init(uniqueKeysWithValues: elements)))
    }
}

extension Value: ExpressibleByArrayLiteral {
    public init(arrayLiteral elements: JSONValue...) {
        self = .primitive(.jsonArray(elements))
    }
}

extension Value: ExpressibleByStringLiteral {
    public init(stringLiteral value: String) {
        self = .primitive(.string(value))
    }
}

extension Value: ExpressibleByIntegerLiteral {
    public init(integerLiteral value: Int) {
        self = .primitive(.number(Double(value)))
    }
}

extension Value: ExpressibleByFloatLiteral {
    public init(floatLiteral value: Double) {
        self = .primitive(.number(value))
    }
}

extension Value: ExpressibleByBooleanLiteral {
    public init(booleanLiteral value: Bool) {
        self = .primitive(.bool(value))
    }
}

// MARK: - Setting list and map values directly from another LiveObject

// Lawrence: We don't have these in the current LiveObjects Swift interface but I was toying with the idea of having them. On the one hand they make these call sites neater, but at the cost of losing some consistency — e.g. why can you pass a LiveCounter directly to one of these methods but you can't pass it as a value in the initialData dictionary of LiveMap.create?

public extension LiveMapOperations {
    // LiveMap value
    func set(key: String, value: LiveMap) async throws {
        try await set(key: key, value: .liveMap(value))
    }

    func set(key: String, value: LiveMap, options: OperationOptions) async throws {
        try await set(key: key, value: .liveMap(value), options: options)
    }

    // LiveCounter value
    func set(key: String, value: LiveCounter) async throws {
        try await set(key: key, value: .liveCounter(value))
    }

    func set(key: String, value: LiveCounter, options: OperationOptions) async throws {
        try await set(key: key, value: .liveCounter(value), options: options)
    }

    // LiveList value
    func set(key: String, value: LiveList) async throws {
        try await set(key: key, value: .liveList(value))
    }

    func set(key: String, value: LiveList, options: OperationOptions) async throws {
        try await set(key: key, value: .liveList(value), options: options)
    }
}

public extension LiveListOperations {
    // LiveMap value
    func append(_ value: LiveMap) async throws {
        try await append(.liveMap(value))
    }

    func append(_ value: LiveMap, options: OperationOptions) async throws {
        try await append(.liveMap(value), options: options)
    }

    func prepend(_ value: LiveMap) async throws {
        try await prepend(.liveMap(value))
    }

    func prepend(_ value: LiveMap, options: OperationOptions) async throws {
        try await prepend(.liveMap(value), options: options)
    }

    func insert(at index: Int, value: LiveMap) async throws {
        try await insert(at: index, value: .liveMap(value))
    }

    func insert(at index: Int, value: LiveMap, options: OperationOptions) async throws {
        try await insert(at: index, value: .liveMap(value), options: options)
    }

    // LiveCounter value
    func append(_ value: LiveCounter) async throws {
        try await append(.liveCounter(value))
    }

    func append(_ value: LiveCounter, options: OperationOptions) async throws {
        try await append(.liveCounter(value), options: options)
    }

    func prepend(_ value: LiveCounter) async throws {
        try await prepend(.liveCounter(value))
    }

    func prepend(_ value: LiveCounter, options: OperationOptions) async throws {
        try await prepend(.liveCounter(value), options: options)
    }

    func insert(at index: Int, value: LiveCounter) async throws {
        try await insert(at: index, value: .liveCounter(value))
    }

    func insert(at index: Int, value: LiveCounter, options: OperationOptions) async throws {
        try await insert(at: index, value: .liveCounter(value), options: options)
    }

    // LiveList value
    func append(_ value: LiveList) async throws {
        try await append(.liveList(value))
    }

    func append(_ value: LiveList, options: OperationOptions) async throws {
        try await append(.liveList(value), options: options)
    }

    func prepend(_ value: LiveList) async throws {
        try await prepend(.liveList(value))
    }

    func prepend(_ value: LiveList, options: OperationOptions) async throws {
        try await prepend(.liveList(value), options: options)
    }

    func insert(at index: Int, value: LiveList) async throws {
        try await insert(at: index, value: .liveList(value))
    }

    func insert(at index: Int, value: LiveList, options: OperationOptions) async throws {
        try await insert(at: index, value: .liveList(value), options: options)
    }
}

public extension UnionOperations {
    // LiveMap operations - LiveMap value
    func set(key: String, value: LiveMap) async throws {
        try await set(key: key, value: .liveMap(value))
    }

    func set(key: String, value: LiveMap, options: OperationOptions) async throws {
        try await set(key: key, value: .liveMap(value), options: options)
    }

    // LiveMap operations - LiveCounter value
    func set(key: String, value: LiveCounter) async throws {
        try await set(key: key, value: .liveCounter(value))
    }

    func set(key: String, value: LiveCounter, options: OperationOptions) async throws {
        try await set(key: key, value: .liveCounter(value), options: options)
    }

    // LiveMap operations - LiveList value
    func set(key: String, value: LiveList) async throws {
        try await set(key: key, value: .liveList(value))
    }

    func set(key: String, value: LiveList, options: OperationOptions) async throws {
        try await set(key: key, value: .liveList(value), options: options)
    }

    // LiveList operations - LiveMap value
    func append(_ value: LiveMap) async throws {
        try await append(.liveMap(value))
    }

    func append(_ value: LiveMap, options: OperationOptions) async throws {
        try await append(.liveMap(value), options: options)
    }

    func prepend(_ value: LiveMap) async throws {
        try await prepend(.liveMap(value))
    }

    func prepend(_ value: LiveMap, options: OperationOptions) async throws {
        try await prepend(.liveMap(value), options: options)
    }

    func insert(at index: Int, value: LiveMap) async throws {
        try await insert(at: index, value: .liveMap(value))
    }

    func insert(at index: Int, value: LiveMap, options: OperationOptions) async throws {
        try await insert(at: index, value: .liveMap(value), options: options)
    }

    // LiveList operations - LiveCounter value
    func append(_ value: LiveCounter) async throws {
        try await append(.liveCounter(value))
    }

    func append(_ value: LiveCounter, options: OperationOptions) async throws {
        try await append(.liveCounter(value), options: options)
    }

    func prepend(_ value: LiveCounter) async throws {
        try await prepend(.liveCounter(value))
    }

    func prepend(_ value: LiveCounter, options: OperationOptions) async throws {
        try await prepend(.liveCounter(value), options: options)
    }

    func insert(at index: Int, value: LiveCounter) async throws {
        try await insert(at: index, value: .liveCounter(value))
    }

    func insert(at index: Int, value: LiveCounter, options: OperationOptions) async throws {
        try await insert(at: index, value: .liveCounter(value), options: options)
    }

    // LiveList operations - LiveList value
    func append(_ value: LiveList) async throws {
        try await append(.liveList(value))
    }

    func append(_ value: LiveList, options: OperationOptions) async throws {
        try await append(.liveList(value), options: options)
    }

    func prepend(_ value: LiveList) async throws {
        try await prepend(.liveList(value))
    }

    func prepend(_ value: LiveList, options: OperationOptions) async throws {
        try await prepend(.liveList(value), options: options)
    }

    func insert(at index: Int, value: LiveList) async throws {
        try await insert(at: index, value: .liveList(value))
    }

    func insert(at index: Int, value: LiveList, options: OperationOptions) async throws {
        try await insert(at: index, value: .liveList(value), options: options)
    }
}
