import {
  Channel,
  PathObject,
  LiveMap,
  LiveList,
  LiveCounter,
  Value,
  Instance,
} from "../src";

const channel: Channel = {} as Channel;

type Project = {
  title: string;
  active: boolean;
  age: number;
  image: Buffer;
  tags: string[];
  metadata: { category: string; budget: number };
  score: LiveCounter;
  owner: LiveMap<{ name: string; role: string }>;
  tasks: LiveList<
    LiveMap<{
      text: string;
      done: boolean;
      votes: LiveCounter;
      assignee: { name: string; id: number };
    }>
  >;
  dependencies: LiveList<string>;
};

async function overview() {
  // Obtain the channel object. The promise resolves when the initial sync is complete.
  // Optionally provide a schema for rich type inference.
  const project = await channel.object.get<Project>();

  // In the event of a disconnection, the client will automatically resync.
  // Listen for these state changes through lifecycle event listeners.
  channel.object.on("syncing", () => console.log("syncing"));
  channel.object.on("synced", () => console.log("synced"));

  // Navigate through the object structure using chained `get()` calls.
  project.get("tasks").get(0).get("text");

  // Use `value()` to read leaf values at a path. This includes both primitive
  // and LiveCounter values.
  project.get("title").value();
  project.get("active").value();
  project.get("age").value();
  project.get("image").value();
  project.get("tags").value();
  project.get("metadata").value();
  project.get("score").value();
  project.get("owner").get("name").value();
  project.get("tasks").get(0).get("text").value();

  // Note that type inference from the supplied schema allows us to determine
  // what methods should available at a path.
  // For example, the following will give a type error, as a LiveMap is a collection type,
  // rather than a leaf value, and so does not have a `value()` method:
  // project.get("owner").value();

  // If a key does not exist on a LiveMap, `value()` returns undefined.
  if (project.get("title").value() === undefined) console.log("title not set");

  // Similarly, if a LiveCounter instance referenced by a LiveMap entry cannot be
  // resolved (e.g. because the client has not yet seen the CREATE operation for the
  // LiveCounter) then `value()` returns undefined.
  if (project.get("score").value() === undefined) console.log("no score yet");

  // Perform operations to update values.
  // The promise returned from an operation method is resolved when the operation message has been published.
  await project.set("title", "My Project");
  await project.set("active", true);
  await project.remove("image");
  await project.get("score").increment(5);
  await project.get("tasks").get(0).set("done", true);
  await project.get("dependencies").append("project:123");

  // You can also store JSON values as primitives.
  project.get("tags").value();
  project.get("metadata").value();

  // Note that JSON values can only contain the supported primitive types,
  // i.e. `string`, `number`, `boolean`, `Buffer`, or another JSON value.
  // Other JS types are not supported.
  // For example, the following will give a type error:
  // channel.object.get<{ foo: Date }>();

  // JSON values are primitives, not live types. Any operations you perform on them
  // are entirely local and will NOT be reflected other clients.
  project.get("tags").value()?.push("strategic");

  // Only live type operations are reflected to other clients.
  // To updates tags, set the value of that key on the LiveMap.
  await project.set("tags", ["strategic"]);

  // Operation methods optionally accept a set of options.
  // Idempotent publishing is supported with a client-specified message ID.
  await project.get("score").increment(1, {
    id: "my-msg-id",
  });
  // Supply custom headers through message extras.
  await project.set("age", 5, {
    extras: { headers: { "user-action": "manual-edit" } },
  });
  // Specify an encoding that can be used by the subscriber to interpret the raw value.
  await project.set(
    "image",
    Buffer.from([]), // raw image data
    {
      encoding: "jpeg",
    },
  );
  // The encoding is stored on the entry, and can be accessed via the `encoding()` method.
  // Note that if no encoding was specified, it returns `undefined`.
  project.get("image").encoding(); // "jpeg"
  // A client-supplied encoding is only supported for string and Buffer primitives.
  // For example, the following will give a type error:
  // project.get("age").encoding()

  // Use the static `create` methods for each live type to construct nested objects.
  // The value returned from `create` can be supplied to operation methods that assign
  // values to a collection type (i.e. a LiveMap or LiveList).
  // This pattern supports deep instantiation.
  await project.set(
    "tasks",
    LiveList.create([
      LiveMap.create({
        text: "buy milk",
        done: false,
        votes: LiveCounter.create(0),
        assignee: { name: "Mike", id: 1 },
      }),
    ]),
  );
  await project.get("tasks").append(
    LiveMap.create({
      text: "buy bread",
      done: false,
      votes: LiveCounter.create(0),
      assignee: { name: "Andrii", id: 2 },
    }),
  );

  // Batch operations let you perform multiple operations atomically.
  // When you call `batch()`, the client resolves the specific object instance
  // at a given path and provides a BatchContext to the callback that allows
  // you to mutate that specific instance (or a descendant thereof).
  // The operation methods on a BatchContext support rich type-inference.
  // The available mutation methods are equivalent to those outside of a
  // BatchContext except that they are synchronous.
  // The `batch()` method returns a promise which resolves when the batch
  // operation message has been sent.
  await project.batch((ctx) => {
    ctx.set("title", "Updated Project");
    ctx.set("active", false);
    const scoreCtx = ctx.get("score");
    if (scoreCtx) {
      scoreCtx.increment(10);
    }
  });

  // Obtain the number of entries in collection types.
  project.get("tasks").length();
  project.get("tasks").get(0).size();

  // Iteration methods let you traverse collection types, which yield
  // the entries in the collection.
  for (const task of project.get("tasks").entries()) {
    for (const [key, item] of task.entries()) {
      // ...
    }
    for (const key of task.keys()) {
      // ...
    }
    for (const item of task.values()) {
      // ...
    }
  }

  // Subscriptions let you listen for changes to objects at a specific path.
  // The subscription follows whatever exists at that path, switching automatically
  // if the value at that path changes.
  // The `subscribe()` method returns an `unsubscribe` function that can be called
  // to remove the subscription.
  const unsubscribe = project.get("score").subscribe(() => {
    // invoked even if the specific LiveCounter instance at the `score` entry changes
  });
  unsubscribe(); // unregisters the subscribe callback

  // Subscriptions are deep by default.
  // Subscribe with depth control to limit how deep into nested objects you listen.
  project.get("tasks").subscribe(
    () => {
      // The callback is invoked only for changes to the object located at the `tasks`
      // entry, and not for changes to the actual items inside that object. In this
      // case, the callback is invoked when LiveMap items are added, removed or re-ordered
      // in the LiveList, but not if any of the LiveMap items themselves are updated.
      // Note that if the LiveList contained primitive values, the callback *would* be invoked,
      // as changes to primitive entries in the LiveList collection constitute a change to the
      // LiveList object itself.
    },
    { depth: 1 },
  );

  // You can also use async iterators for subscriptions.
  for await (const event of project.get("tasks").subscribeIterator()) {
    // ...
  }

  // The subscription event includes details from the original operation message that lead to the change.
  // The `payload()` returns the representation of the operation as defined in the `data` attribute
  // of the REST API request body: https://ably.com/docs/api/liveobjects-rest#section/LiveObjects-REST-API
  for await (const event of project.get("tasks").subscribeIterator()) {
    event.message.id;
    event.message.timestamp;
    event.message.clientId;
    event.message.connectionId;
    event.message.channel;
    event.message.extras;
    event.message.serial;
    event.message.siteCode;
    event.message.encoding;
    event.message.payload();
  }

  // Similar to presence, the recommended pattern is to allow the client to materialise operations
  // and the user should read back actual values in the subscribe callback.
  for await (const _ of project.get("tasks").subscribeIterator()) {
    project.get("tasks").get(0).get("done").value();
  }

  // So far we have interacted with our object via the `PathObject` API.
  // A `PathObject` represents a reference to a particular location in the object,
  // defined by a path.
  // Note the inferred type of `project`: it is a `LiveMapPathObject<Project>`.
  // Another way of expressing this type is: `PathObject<LiveMap<Project>>`
  const myProject: PathObject<LiveMap<Project>> = project;

  // Note that a PathObject for the resulting path is always returned from `get()`
  // regardless of whether anything exists in the object at that path.
  // This allows a PathObject to be a stable reference to a location regardless
  // of what actually exists at that location.
  const myObject = await channel.object.get(); // PathObject for the root path ""
  myObject.get("foo"); // PathObject for the path "foo"
  myObject.get("foo").get("bar"); // PathObject for the path "foo.bar"
  myObject.get("foo").get(0).get("bar"); // PathObject for the path "foo[0].bar"

  // However, when using a schema, TypeScript is aware if you access a path that is
  // not defined in the schema.
  // For example, the following will give a type error, because the `foo` fields is
  // not defined on the Project type:
  // project.get("foo");

  // Obtain the string representation of a path using the `path()` method.
  project.get("tasks").get(0).get("text").path(); // tasks[0].text

  // You can obtain a `PathObject` for any string path using `at()`.
  // Note however that this loses rich type inference.
  project.at("tasks[0].text").value(); // return type is `Primitive | undefined`, which is wider than `string | undefined`.

  // Calling an operation method on a PathObject will evaluate the path at the time
  // the operation method is invoked. The client will attempt to follow each path
  // segment from the root and obtain the current value at that entry. If the entry is
  // successfully resolved, and the entry contains a reference to another object, it
  // will attempt to call the relevant operation method on that specific object instance.
  // If the entry or instance cannot be resolved, the operation method will throw.
  try {
    await project.get("owner").set("name", "Mike");
  } catch (err) {
    // error was thrown if the entry at the "owner" key did not resolve
    // to a LiveMap instance, which has a `set` operation method.
  }

  // Note however that providing a schema allows you to assert what you expect the
  // structure of the object to be, and TypeScript will surface only the relevant methods
  // for the expected structure.
  // For example, the following will give a type error, because the value at the `owner`
  // field is expected to be a LiveMap, which does not have an `increment()` method.
  //
  // await project.get("owner").increment();
  //
  // Similarly, the following will give a type error, because the value at the `owner`
  // field is expected to be a LiveMap, which does not have a `value()` method (it is
  // a collection type, not a leaf value):
  //
  // project.get("owner").value();

  // When rich type information is not known (e.g. because a schema is not provided),
  // all possible methods are made available.
  // When an operation method is invoked, the client will attempt to resolve an object
  // at that path, and throw an error if either an entry could not be resolved at that
  // path, a referenced object instance at that entry could not be resolved, or if the
  // operation method is invalid for the object that currently exists at that path.
  try {
    await myObject.get("owner").set("name", "Mike");
  } catch (err) {
    // an error was thrown if a LiveMap instance cannot be resolved at "owner"
  }
  try {
    await myObject.get("owner").increment();
  } catch (err) {
    // an error was thrown if a LiveCounter instance cannot be resolved at "owner"
  }

  // This is why the `value()` method can return `undefined`: if the entry cannot be
  // resolved at that path, or if the path does not refer to a leaf value (i.e. a
  // primitive or a LiveCounter), it returns undefined.
  myObject.get("owner").value(); // undefined if e.g. `owner` contains a collection type (such as a LiveMap)

  // Note that the `Project` schema we defined is a compile-time nicety. There is
  // no runtime enforcement that the channel object conforms to this schema.
  // To check that the value at a path is the type you expect, use a type assertion
  // method. These methods will throw an error if the underlying type does not match
  // what you expect. This is possible for live types even if the referenced object
  // cannot yet be resolved, since the type of an object can be inferred from its ID.
  project.get("title").asPrimitive();
  project.get("owner").asLiveMap();
  project.get("tasks").asLiveList();
  project.get("score").asLiveCounter();

  // If a type assertion does not throw, you obtain an object of the expected type.
  const firstTask: PathObject<LiveMap<Record<string, Value>>> = project
    .at("tasks[0]")
    .asLiveMap();

  // Note that we don't have full type inference, though. I can `set` any key and value, even
  // though we didn't declare those fields on the schema.
  await firstTask.set("foo", "bar");

  // To bring back nice type inference, specify the expected type as a type parameter.
  // Remember, this is still a compile-time nicety. The type assertion method will throw
  // if the underlying instance does not match the asserted type; however it will not (cannot)
  // validate that the runtime value at that location conforms to the specified shape.
  project
    .at("owner")
    .asLiveMap<{ name: string; role: string }>()
    .get("name")
    .value();

  // It is also possible to obtain the specific instance currently located at a given path
  // using the `instance()` method. This method returns an Instance<LiveMap> for the expected shape.
  // Note that `instance()` will return `undefined` if an object instance cannot be resolved at
  // that path.
  const owner: Instance<LiveMap<{ name: string; role: string }>> | undefined =
    project.get("owner").instance();

  // When you have obtained an object instance, you can access its object ID.
  project.get("owner").instance()?.id();

  // When using a schema, the `instance` method is not available unless the expected value at that
  // path is a live type.
  // For example, the following will give a type error, because the value at the `title` field is
  // expected to be a string primitive, rather than a LiveMap, LiveList or LiveCounter:
  // project.get("title").instance();

  // Once you have a reference to a specific instance, you can interact with it using an equivalent
  // API to that available on a PathObject. However, methods on an Instance apply to the specific
  // object instance that was previously obtained, rather than re-evaluating the instance at the
  // given path at the time the method was called.
  await owner?.set("name", "Mike");
  await owner?.batch((ctx) => {
    ctx.set("name", "Mike");
    ctx.set("role", "developer");
  });
  if (owner) {
    for (const [key, value] of owner?.entries()) {
      // ...
    }
  }

  // The Instance API also supports navigating the object structure.
  // However, the `get()` method on an Instance may return undefined if the specified entry in that
  // instance does not exist, or if the instance of an object referenced at that entry cannot be resolved.
  const taskList = project.get("tasks").instance();
  if (taskList) {
    taskList.get(1)?.get("votes")?.value();
  }

  // You can subscribe to a specific object instance, rather than a path.
  // The subscription observes changes to the specific instance, even if its location changes.
  // For example, we can select the first task and continue to subscribe to it, even if its position
  // in the task list changes.
  const selectedTask = project.get("tasks").get(0).instance(); // get the task at the first position
  selectedTask?.subscribe((event) => {
    // ...
  });

  // Unlike a PathObject subscription, an instance subscription is no longer valid if the object becomes
  // deleted, which happens if it is no longer reachable from the root. If this happens, the subscription
  // is automatically unregistered, after surfacing the OBJECT_DELETE message in the callback.
  selectedTask?.subscribe((event) => {
    if (
      event.message.payload().operation === "OBJECT_DELETE" &&
      event.message.payload().objectId === selectedTask.id()
    ) {
      // goodbye!
    }
  });
}
