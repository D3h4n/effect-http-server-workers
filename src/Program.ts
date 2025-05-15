import { Console, Effect, Layer } from "effect";
import { HttpApiBuilder } from "@effect/platform";
import { createServer } from "node:http";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import Api, { ApiError } from "@/Api.js";
import { Pool, PoolLive } from "@/Pool.js";

const handleEndpoint = (endpoint: string) =>
  Effect.gen(function* () {
    const workerPool = yield* Pool;
    return yield* workerPool.executeEffect(endpoint);
  }).pipe(
    Effect.tap(Console.log(`Handling ${endpoint}/ ...`)),
    Effect.catchAll((error) =>
      Effect.fail(
        new ApiError({
          msg: `Error: failed to handle request: ${error}`,
        }),
      ),
    ),
  );

const handle404 = () =>
  Effect.fail("<h1>404: Page Not Found</h1><br><a href='/'>Home</a>");

const ApiIndexGroupImplementation = HttpApiBuilder.group(
  Api,
  "Index",
  (handlers) =>
    handlers
      .handle("home", () => handleEndpoint("home"))
      .handle("about", () => handleEndpoint("about"))
      .handle("catchAll", () => handle404()),
);

const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(ApiIndexGroupImplementation),
);

const ServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(ApiLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
  Layer.provide(PoolLive),
);

Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
