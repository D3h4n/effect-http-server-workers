import { WorkerRunner } from "@effect/platform";
import { NodeRuntime, NodeWorkerRunner } from "@effect/platform-node";
import { Effect, Layer } from "effect";

const worker = Effect.gen(function* () {
  yield* WorkerRunner.make((endpoint: string) =>
    Effect.gen(function* () {
      switch (endpoint) {
        case "home":
          return yield* Effect.succeed(
            "<h1>Home</h1><br><a href='/about'>About</a>",
          );
        case "about":
          return yield* Effect.succeed(
            "<h1>About</h1><br><a href='/'>Home</a>",
          );
        default:
          return yield* Effect.fail("Unknown Endpoint");
      }
    }),
  );
}).pipe(Layer.scopedDiscard, Layer.provide(NodeWorkerRunner.layer));

NodeWorkerRunner.launch(worker).pipe(NodeRuntime.runMain);
