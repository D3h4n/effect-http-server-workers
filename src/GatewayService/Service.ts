import { Console, Effect, Layer } from "effect";
import { FetchHttpClient, HttpApiBuilder } from "@effect/platform";
import { createServer } from "node:http";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Api } from "./Api.js";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { NodeWorkersRpc } from "@/WorkerService/index.js";

const NodeWorkersRpcClient = RpcClient.make(NodeWorkersRpc);
const RpcProtocolLive = RpcClient.layerProtocolHttp({
  url: "http://localhost:8080/rpc",
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerMsgPack]));

const ApiIndexGroupImplementation = HttpApiBuilder.group(
  Api,
  "Index",
  (handlers) =>
    handlers
      .handle("home", ({ urlParams }) =>
        Effect.gen(function* () {
          const rpc = yield* NodeWorkersRpcClient;
          yield* Console.log(
            "[Gateway Service] Handling request for Home Page",
          );
          return yield* rpc.HomePage(urlParams);
        }),
      )
      .handle("about", ({ urlParams }) =>
        Effect.gen(function* () {
          const rpc = yield* NodeWorkersRpcClient;
          yield* Console.log(
            "[Gateway Service] Handling request for About Page",
          );
          return yield* rpc.AboutPage(urlParams);
        }),
      )
      .handle("catchAll", () =>
        Effect.gen(function* () {
          const rpc = yield* NodeWorkersRpcClient;
          yield* Console.log(
            "[Gateway Service] Handling request for Unknown Page",
          );
          return yield* Effect.fail(yield* rpc.UnknownPage({ content: "" }));
        }),
      ),
);

const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(ApiIndexGroupImplementation),
);

const ServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(ApiLive),
  Layer.provide(RpcProtocolLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
);

Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
