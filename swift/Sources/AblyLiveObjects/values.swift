import Foundation

// TODO: in our previous LiveObjects-swift we ditched this type and incorporated it into LiveMapValue, see if that is something to do again
// Primitive types that can be stored in collection types.
// Includes JSON-serialisable data so that maps and lists
// can hold plain JS values.
public enum Primitive {
    case string(String)
    case number(Double)
    case bool(Bool)
    case data(Data)
    case jsonArray([JSONValue])
    case jsonObject([String: JSONValue])
}

// Lawrence: Note that this is only used for setting, not getting. But TODO I don't understand how you assign an _existing_ object to a new location, i.e. without creating a new object
// Type union that defines the base set of allowed types that can be stored in collection types.
// Describes the set of all possible values that can parameterize PathObject.
// This is the canonical union used when we cannot infer a narrower type.
public enum Value {
    // Lawrence: This is like the LiveMapValue type in the current LiveObjects plugin (have reverted to using the `primitive` naming given by TS, will revisit)
    case primitive(Primitive)
    // TODO: but what can you do if you get one of these? LiveMap and LiveList and LiveCounter don't have any methods on them
    case liveMap(LiveMap)
    case liveCounter(LiveCounter)
    case liveList(LiveList)
}

// LiveObject type class implementations.
// Currently only defines the static method used to create branded value types
// which can be provided as an argument to mutation methods.

// swiftformat:disable enumNamespaces
public struct LiveMap {
    public static func create(
        initialData _: [String: Value] = [:],
    ) -> Self {
        fatalError("Not implemented")
    }
}

public struct LiveList {
    public static func create(
        initialData _: [Value] = [],
    ) -> Self {
        fatalError("Not implemented")
    }
}

public struct LiveCounter {
    public static func create(
        initialValue _: Double = 0,
    ) -> Self {
        fatalError("Not implemented")
    }
}

// swiftformat:enable enumNamespaces
