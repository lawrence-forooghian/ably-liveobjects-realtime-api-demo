import { Channel, LiveMap, LiveCounter } from "../src";

const channel: Channel = {} as Channel;

async function votingExample() {
  // Get channel (root) object with typed schema for voting poll
  const poll = await channel.object.get<{
    question: string;
    votes: LiveMap<{
      yes: LiveCounter;
      no: LiveCounter;
    }>;
  }>();

  // Initialize poll
  await poll.set("question", "Should we adopt this proposal?");
  await poll.set(
    "votes",
    LiveMap.create({
      yes: LiveCounter.create(0),
      no: LiveCounter.create(0),
    }),
  );

  // Subscribe to real-time vote count changes
  poll.get("votes").subscribe(({ object }) => {
    const yes = object.get("yes").value() || 0;
    const no = object.get("no").value() || 0;
    const total = yes + no;

    if (total > 0) {
      const yesPercent = Math.round((yes / total) * 100);
      const noPercent = 100 - yesPercent;
      console.log(`Yes: ${yes}%\tNo: ${noPercent}%`);
    }
  });

  // Cast some votes
  await castVote("yes");
  await castVote("no");
  await castVote("yes");

  async function castVote(choice: "yes" | "no") {
    await poll.get("votes").get(choice).increment(1);
  }
}
