import { Context, Layer } from "effect";
import { Worker } from "@effect/platform";
import { NodeWorker } from "@effect/platform-node";
import { Worker as NativeNodeWorker } from "node:worker_threads";
import { NodeWorkerError, NodeWorkerRequest } from "./worker/index.js";

export interface MyWorkerPool {
  readonly _: unique symbol;
}

export const NodeWorkerPool = Context.GenericTag<
  MyWorkerPool,
  Worker.WorkerPool<NodeWorkerRequest, string, NodeWorkerError>
>("MyWorkerPool");

export const NodeWorkerPoolLive = Worker.makePoolLayer(NodeWorkerPool, {
  size: 5,
  concurrency: 2,
}).pipe(Layer.provide(NodeWorker.layer(() => tsWorker("./worker/Worker.ts"))));

const tsWorker = (path: string) => {
  const url = new URL(path, import.meta.url);
  return new NativeNodeWorker(
    `import('tsx/esm/api').then(({ register }) => { register(); import('${url.pathname}') })`,
    {
      eval: true,
    },
  );
};
