import { Channel, LiveMap, LiveCounter } from "../src";

const channel: Channel = {} as Channel; // Channel provides access to live objects

type GameState = {
  players: LiveMap<{
    alice: LiveMap<{ name: string; score: LiveCounter }>;
    bob: LiveMap<{ name: string; score: LiveCounter }>;
  }>;
};

async function main() {
  // Get the (root) channel object with typed schema for game state
  const game = await channel.object.get<GameState>();

  // Initialize players using LiveMap.create() and LiveCounter.create()
  await game.get("players").set(
    "alice",
    LiveMap.create({
      name: "Alice",
      score: LiveCounter.create(0),
    }),
  );
  await game.get("players").set(
    "bob",
    LiveMap.create({
      name: "Bob",
      score: LiveCounter.create(0),
    }),
  );

  // Subscribe to real-time score changes for a specific player
  game
    .get("players")
    .get("alice")
    .get("score")
    .subscribe(async ({ object }) => {
      console.log(`Alice: ${object.value()}`);
    });

  // Simulate gameplay by incrementing scores
  await game.get("players").get("alice").get("score").increment(50);
  await game.get("players").get("bob").get("score").increment(30);

  // Reset the player scores atomically with a batch update
  await game.get("players").batch((ctx) => {
    for (const [_, player] of ctx.entries()) {
      player.set("score", LiveCounter.create(0));
    }
  });

  // Subscribe to real-time leaderboard changes
  game.get("players").subscribe(({ object }) => {
    const leaderboard = [...object.values()];
    leaderboard.sort((a, b) =>
      (a.get("score").value() || 0) > (b.get("score").value() || 0) ? 1 : -1,
    );
    console.log(
      `Leaderboard: ${leaderboard
        .map(
          (item) =>
            `Name: ${item.get("name").value()}\tScore: ${item.get("score").value()}`,
        )
        .join("\n")}`,
    );
  });
}
