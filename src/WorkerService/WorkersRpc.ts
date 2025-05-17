import { Rpc, RpcGroup } from "@effect/rpc";
import { Console, Effect, Layer, Schema } from "effect";
import { ApiError } from "@/GatewayService/index.js";
import { NodeWorkerPool, NodeWorkerPoolLive } from "./Pool.js";
import { NodeWorkerRequest, NodeWorkerRequestSchema } from "./worker/index.js";

export class NodeWorkersRpcRequestSchema extends NodeWorkerRequestSchema.omit(
  "page",
) {}

export type NodeWorkersRpcRequest = Schema.Schema.Type<
  typeof NodeWorkersRpcRequestSchema
>;

export class NodeWorkersRpc extends RpcGroup.make(
  Rpc.make("HomePage", {
    error: ApiError,
    success: Schema.String,
    payload: NodeWorkersRpcRequestSchema,
  }),
  Rpc.make("AboutPage", {
    error: ApiError,
    success: Schema.String,
    payload: NodeWorkersRpcRequestSchema,
  }),
  Rpc.make("UnknownPage", {
    error: ApiError,
    success: Schema.String,
    payload: NodeWorkersRpcRequestSchema,
  }),
) {}

export class NodeWorkersService extends Effect.Service<NodeWorkersService>()(
  "NodeWorkerService",
  {
    effect: Effect.gen(function* () {
      const workers = yield* NodeWorkerPool;
      return {
        handleRequest: (request: NodeWorkerRequest) =>
          workers.executeEffect(request).pipe(
            Effect.tap(
              Console.log(
                `[Worker Service] Handled request for ${request.page}/`,
              ),
            ),
            Effect.catchAll((error) =>
              Effect.fail(
                new ApiError({
                  msg: `Error: failed to handle request: ${error}`,
                }),
              ),
            ),
          ),
      };
    }),
  },
) {}

export const NodeWorkersLive = NodeWorkersRpc.toLayer(
  Effect.gen(function* () {
    const workersService = yield* NodeWorkersService;
    return {
      HomePage: (req) => workersService.handleRequest({ ...req, page: "home" }),
      AboutPage: (req) =>
        workersService.handleRequest({ ...req, page: "about" }),
      UnknownPage: (req) =>
        workersService.handleRequest({ ...req, page: "404" }),
    };
  }),
).pipe(
  Layer.provide(NodeWorkersService.Default),
  Layer.provide(NodeWorkerPoolLive),
);
