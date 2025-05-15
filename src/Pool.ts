import { Context, Layer } from "effect";
import { Worker } from "@effect/platform";
import * as WT from "node:worker_threads";
import { NodeWorker } from "@effect/platform-node";

interface MyWorkerPool {
  readonly _: unique symbol;
}

export const Pool = Context.GenericTag<
  MyWorkerPool,
  Worker.WorkerPool<string, string, string>
>("@app/MyWorkerPool");

export const PoolLive = Worker.makePoolLayer(Pool, {
  size: 5,
  concurrency: 2,
}).pipe(Layer.provide(NodeWorker.layer(() => tsWorker("./worker/Worker.ts"))));

const tsWorker = (path: string) => {
  const url = new URL(path, import.meta.url);
  return new WT.Worker(
    `import('tsx/esm/api').then(({ register }) => { register(); import('${url.pathname}') })`,
    {
      eval: true,
    },
  );
};
