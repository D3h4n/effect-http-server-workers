import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Layer } from "effect";
import { HttpRouter } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "http";

import { NodeWorkersLive, NodeWorkersRpc } from "./WorkersRpc.js";

const RpcLayer = RpcServer.layer(NodeWorkersRpc).pipe(
  Layer.provide(NodeWorkersLive),
);

const HttpProtocol = RpcServer.layerProtocolHttp({
  path: "/rpc",
}).pipe(Layer.provide(RpcSerialization.layerMsgPack));

const Main = HttpRouter.Default.serve().pipe(
  Layer.provide(RpcLayer),
  Layer.provide(HttpProtocol),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 8080 })),
);

Layer.launch(Main).pipe(NodeRuntime.runMain);
