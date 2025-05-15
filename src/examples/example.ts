import {Effect, Context} from "effect"

class RandomService extends Context.Tag("MyRandomService")<RandomService, { readonly next: Effect.Effect<number> }>() {}

const program = Effect.gen(function*() {
  const random = yield* RandomService
  const number = yield* random.next

  if (number < .5) {
    return yield* Effect.succeed(`Succeeded with: ${number}`)
  } else {
    return yield* Effect.fail(`Failed with: ${number}`)
  }
})
.pipe(
  Effect.match({
    onFailure: (error) => console.error(error),
    onSuccess: (value) => console.log(value)
  })
)

const runnable = Effect.provideService(program, RandomService, {
  next: Effect.sync(() => Math.random())
})

Effect.runPromise(runnable)

