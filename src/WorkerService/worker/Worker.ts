import { WorkerRunner } from "@effect/platform";
import { NodeRuntime, NodeWorkerRunner } from "@effect/platform-node";
import { Console, Effect, Layer } from "effect";
import { NodeWorkerError, NodeWorkerRequest } from "./Types.js";

const worker = Effect.gen(function* () {
  yield* WorkerRunner.make(({ page, content }: NodeWorkerRequest) =>
    Effect.gen(function* () {
      yield* Console.log(`[Worker] Received request for page "${page}"`);
      yield* Effect.sleep("2 seconds"); // simulate some hard work
      switch (page) {
        case "home":
          return yield* Effect.succeed(
            `<h1>Home</h1><br><a href='/about'>About</a><br><p>${content}</p>`,
          );
        case "about":
          return yield* Effect.succeed(
            `<h1>About</h1><br><a href='/'>Home</a><br><p>${content}</p>`,
          );
        case "404":
          return yield* Effect.succeed(
            "<h1>404: Page Not Found</h1><br><a href='/'>Home</a>",
          );
        default:
          return yield* Effect.fail(
            new NodeWorkerError({ message: "Unknown Endpoint" }),
          );
      }
    }),
  );
}).pipe(Layer.scopedDiscard, Layer.provide(NodeWorkerRunner.layer));

NodeWorkerRunner.launch(worker).pipe(NodeRuntime.runMain);
