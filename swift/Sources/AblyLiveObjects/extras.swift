// Lawrence: have split this out into a separate type so that headers can be separate; this is as an output in ObjectMessage and as an input in OperationOptions
public struct Extras {
    public init(headers: [String: String]? = nil, nonHeaders: [String: JSONValue]) {
        self.headers = headers
        self.nonHeaders = nonHeaders
    }

    var headers: [String: String]?
    // Lawrence: This is my guess here
    var nonHeaders: [String: JSONValue]
}
