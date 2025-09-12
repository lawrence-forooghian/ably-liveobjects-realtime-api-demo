# Swift LiveObjects API

I've had a go at converting most of the TypeScript interfaces and examples to Swift, and you can find the results in this directory. Have written some thoughts and challenges below.

There are a few further thoughts, which I've not had a chance to formulate and write up here yet, dotted about the codebase in the form of TODOs. Probably some of them are also duplicates of what's here so I'd suggest ignoring them for now; I'll mop them up next week.

## Changes

> [!NOTE]
> In Swift, a _protocol_ is the equivalent of a TypeScript interface.

Key changes here compared to TypeScript:

- You are basically always in the same situation as you would be in TypeScript if you were to never pass a generic type argument to a method call. This means that you always start off working with the `AnyPathObject` or `AnyInstance` type, and the API doesn't allow you to statically express what types you expect to find in a given `LiveMap` or `LiveList`.
    - I've called these types `UnionPathObject` and `UnionInstance` in Swift, because preceding a type name with `Any` in Swift has a well-understood meaning already (e.g. `AnyFoo` is a type-erased implementation of the protocol `Foo`). The `Union` naming is chosen because these types offer the union of all of the different possible methods on a path object or instance. (Admittedly, "union type" is also kind of an overloaded term in programming languages.)
- We do not have the generic `Instance` or `PathObject` types because Swift doesn't allow us to create this sort of conditional type. (You can in certain circumstances specialise a generic type's interface based on its generic type arguments, but not to the degree that would let us create these types).
    - If a user wishes to work with one of these types specialised for a specific type of `LiveObject`, then they have to concretely work with the corresponding protocol e.g. `LiveMapPathObject`.
- In Swift, the `Live{Map, Counter, List}` types are only structs (value types), and there is no corresponding interface with that name (they are only used in TypeScript to refine the API of an `Instance` or `PathObject`, and we don't have that functionality). You also can't have multiple types with the same name in Swift.
- The `value` properties on `AnyPathObject` and `AnyInstance` always return the separate type `Primitive` (i.e. a `LiveCounter` value gets collapsed into the `number` case of this type). It's a bit less elegant than in TypeScript, in which any of a union type's cases themselves satisfy the union type.

## Questions about the TS interface

- As I understand it, the `PathObjectRuntimeTypeAssertions` methods throw an error if the object at that path does not have the expected type at the moment of the assertion method being invoked. But I don't really understand the point in this; what does the user learn by the method not throwing? Isn't it just that the object at that path _currently_ has the expected type? But the type of that object could still change in the future, and subsequent calls to any of the type-specific methods might fail for that reason.
- It is not yet fully clear to me from the TypeScript interface which method calls might throw an error. We need to know this for Swift because it has to be part of the interface. (Not a pressing need; I think I can infer a fair amount of it.)
- It seems you can't set an _existing_ LiveObject as an entry in a `LiveMap` or `LiveList`. Is that correct? If so, is it intentional?
- It's not clear to me whether the `Live{Map, Counter, List}` value types actually have data specific to an object instance inside them (i.e. an object ID), or if they're just a template for a creation operation, i.e. if you submit the same one multiple times do you end up with one LiveObject or multiple? I also still think that the names of these types are confusing; e.g. `LiveMap` is both used as a value type that describes a creation operation, and a special marker interface that indicates to the type system what static API it should expose, but it still doesn't seem super obvious that these two things should have the same name.
- Could we perhaps rename the `value` method on `AnyPathObject` and `AnyInstance` to `leafValue`? I think that from the name it's not clear why this couldn't return a LiveObject. Also, currently the comment in `overview.ts` says "If a key does not exist on a LiveMap, `value()` returns undefined", but I think it means "If a key does not exist or the value is not a primitive value or a LiveCounter".
- A comment in `overview.ts` says that you are allowed to put `Buffer` in your "JSON values". Is that correct? It's not really accurate to call it JSON in that case.
- `PrimitiveInstance` extends `InstanceBase`, which has a non-optional `id` property, but there's no object ID for a primitive AFAIK. Perhaps `PrimitiveInstance` doesn't make sense?
- Why does `PathObjectRuntimeTypeAssertions.asPrimitive()` return the primitive type directly instead of a `PrimitivePathObject`?
- When converting to Swift I preserved the ability for subscriptions to emit a generic `SubscriptionEvent` but it's not yet clear to me how this is going to be used (that interface doesn't currently make use of its generic type parameter).
- Are the `asPrimitive()` type assertions also satisfied by a `LiveCounter` (i.e. do they treat a `LiveCounter` as a primitive of type `number`, the same way as the `value` methods elsewhere)?
- What is the shape of the object returned by `ObjectMessage.payload`? It's currently just `any`. Ditto for the `compact` methods.

## Challenges for Swift

- I wonder how viable the `Union*` types will be if we start to have different LiveObject types with methods with the same name but different signatures that can't easily be distinguished as overloads (We actually already have a clash, with two different `values` properties on `UnionPathObjectCollectionMethods`, one for map entries and one for list entries, which I've had to resolve by changing the properties' names. I don't even know how this is currently working in TypeScript to be honest.)
- We don't currently have a way to extract the `encoding` for a primitive, because it's hidden away inside the `PrimitiveInstance` and `PrimitivePathObject` types, which you can't actually get your hands on in our current Swift API.
    - We _could_ change `PrimitivePathObject.asPrimitive()` to return a `PrimitivePathObject` (I've asked above why this isn't the case). Not sure of the instance equivalent because I'm proposing getting rid of `PrimitiveInstance` above).
    - We should probably also add the `encoding` to the `Union*` types?
    - Or, going in a different direction, could we not consider the `encoding` to be part of the `Primitive` value itself instead of being part of the `OperationOptions`; i.e. that a string or binary `Primitive` is actually a structure that contains the data as well as an optional `encoding`? We could do this in TypeScript too, if we wanted.

## Notes for my understanding

- So it looks like in the TS code that `LiveMap`, `LiveCounter` and `LiveList` are not actually interfaces that have functionality any longer; they are just used as generic type parameters that allow the type system to distinguish between different types of `Instance` and `PathObject` and to thus endow them with the correct static API. They are also used in user-defined types (e.g. the `Project` type in the examples) for a user to define the shape of their object.
- A key thing to realise is that `Value` is only used for setting values. For fetching, you always will either get an `Instance` or a `PathObject`, not a value.
- Furthermore, _the only time that a user has an object that conforms to `LiveMap`_ (ditto `Counter`, `List`) is when they call `create` and get the creation operation value type. Again, the rest of the time, they are dealing with an `Instance` or a `PathObject`.

## Questions for my understanding

- Do the `*Instance` types have a stable pointer identity?
