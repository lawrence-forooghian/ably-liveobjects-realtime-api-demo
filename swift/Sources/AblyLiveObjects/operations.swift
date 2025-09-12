// Options that can be provided to operation methods which specify
// additional data to include on the published object message(s).
public struct OperationOptions {
    public init(id: String? = nil, extras: Extras? = nil, encoding: String? = nil) {
        self.id = id
        self.extras = extras
        self.encoding = encoding
    }

    var id: String?
    var extras: Extras?
    var encoding: String?
}

/*
  // Lawrence: skipped
 // Batch multiple operations together using a batch context, which
 // wraps the underlying PathObject or Instance that batch was called from.
 // The batch context always contains a specific resolved instance, even
 // if called from a PathObject. If a specific instance cannot be obtained
 // from the referenced path, batch will throw an error.
 protocol BatchOperation {
   func batch(fn: (BatchContext) -> Void) async throws
 }
  */

public protocol LiveMapOperations {
    func set(key: String, value: Value) async throws
    func set(key: String, value: Value, options: OperationOptions) async throws
    func remove(key: String) async throws
    func remove(key: String, options: OperationOptions) async throws
}

public protocol LiveListOperations {
    func append(_ value: Value) async throws
    func append(_ value: Value, options: OperationOptions) async throws
    func prepend(_ value: Value) async throws
    func prepend(_ value: Value, options: OperationOptions) async throws
    func pop() async throws
    func pop(options: OperationOptions) async throws
    func shift() async throws
    func shift(options: OperationOptions) async throws
    func insert(at index: Int, value: Value) async throws
    func insert(at index: Int, value: Value, options: OperationOptions) async throws
    func remove(at index: Int) async throws
    func remove(at index: Int, options: OperationOptions) async throws
}

public protocol LiveCounterOperations {
    func increment() async throws
    func increment(amount: Double) async throws
    func increment(options: OperationOptions) async throws
    func increment(amount: Double, options: OperationOptions) async throws
}

public protocol UnionOperations {
    // LiveMap operations
    func set(key: String, value: Value) async throws
    func set(key: String, value: Value, options: OperationOptions) async throws
    func remove(key: String) async throws
    func remove(key: String, options: OperationOptions) async throws

    // LiveList operations
    func append(_ value: Value) async throws
    func append(_ value: Value, options: OperationOptions) async throws
    func prepend(_ value: Value) async throws
    func prepend(_ value: Value, options: OperationOptions) async throws
    func pop() async throws
    func pop(options: OperationOptions) async throws
    func shift() async throws
    func shift(options: OperationOptions) async throws
    func insert(at index: Int, value: Value) async throws
    func insert(at index: Int, value: Value, options: OperationOptions) async throws
    func remove(at index: Int) async throws
    func remove(at index: Int, options: OperationOptions) async throws

    // LiveCounter operations
    func increment() async throws
    func increment(amount: Double) async throws
    func increment(options: OperationOptions) async throws
    func increment(amount: Double, options: OperationOptions) async throws
}
