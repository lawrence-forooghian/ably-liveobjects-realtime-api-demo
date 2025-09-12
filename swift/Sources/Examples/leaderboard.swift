import AblyLiveObjects
import Foundation

// Channel provides access to live objects
private let channel: Channel = .init()

// Lawrence: Note that in this example I've used the union types and not the runtime assertions

func leaderboardExample() async throws {
    // Get the (root) channel object for game state
    let game = try await channel.object.get()

    // Initialize players using LiveMap.create() and LiveCounter.create()
    try await game.get(key: "players").set(
        key: "alice",
        value: LiveMap.create(initialData: [
            "name": "Alice",
            "score": .liveCounter(.create(initialValue: 0)),
        ]),
    )
    try await game.get(key: "players").set(
        key: "bob",
        value: LiveMap.create(initialData: [
            "name": "Bob",
            "score": .liveCounter(.create(initialValue: 0)),
        ]),
    )

    // Subscribe to real-time score changes for a specific player
    let score = game.get(key: "players").get(key: "alice").get(key: "score")
    score.subscribe { _ in
        print("Alice: \(score.value?.numberValue ?? 0)")
    }

    // Simulate gameplay by incrementing scores
    try await game.get(key: "players").get(key: "alice").get(key: "score").increment(amount: 50)
    try await game.get(key: "players").get(key: "bob").get(key: "score").increment(amount: 30)

    // Reset the player scores atomically with a batch update
    // TODO: not translated the batch API yet
    /*
     await game.players.batch { ctx in
         for (_, player) in ctx.entries() {
             player.set("score", LiveCounter.create(0))
         }
     }
      */

    // Subscribe to real-time leaderboard changes
    game.get(key: "players").subscribe { _ in
        let leaderboard = game.get(key: "players").values
        let sortedLeaderboard = leaderboard.sorted { a, b in
            (a.get(key: "score").value?.numberValue ?? 0) > (b.get(key: "score").value?.numberValue ?? 0)
        }
        let leaderboardText = sortedLeaderboard.map { item in
            let name = item.get(key: "name").value?.stringValue ?? ""
            let score = item.get(key: "score").value?.numberValue ?? 0
            return "Name: \(name)\tScore: \(score)"
        }.joined(separator: "\n")
        print("Leaderboard: \(leaderboardText)")
    }
}
