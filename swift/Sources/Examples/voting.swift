import AblyLiveObjects
import Foundation

private let channel = Channel()

// Lawrence: Note that in this example I've used the union types and not the runtime assertions

func votingExample() async throws {
    // Get channel (root) object
    let poll = try await channel.object.get()

    // Initialize poll
    try await poll.set(key: "question", value: "Should we adopt this proposal?")
    try await poll.set(
        key: "votes",
        value: LiveMap.create(initialData: [
            "yes": .liveCounter(.create(initialValue: 0)),
            "no": .liveCounter(.create(initialValue: 0)),
        ]),
    )

    // Subscribe to real-time vote count changes
    poll.get(key: "votes").subscribe { _ in
        let yes = poll.get(key: "votes").get(key: "yes").value?.numberValue ?? 0
        let no = poll.get(key: "votes").get(key: "no").value?.numberValue ?? 0
        let total = yes + no

        if total > 0 {
            let yesPercent = Int(round(Double(yes) / Double(total) * 100))
            let noPercent = 100 - yesPercent
            print("Yes: \(yesPercent)%\tNo: \(noPercent)%")
        }
    }

    // Cast some votes
    try await castVote("yes")
    try await castVote("no")
    try await castVote("yes")

    func castVote(_ choice: String) async throws {
        try await poll.get(key: "votes").get(key: choice).increment(amount: 1)
    }
}
