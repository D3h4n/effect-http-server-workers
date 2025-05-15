import { FetchHttpClient, HttpApiClient } from "@effect/platform";
import { Console, Effect } from "effect";

import Api from "./Api.js";

const HttpClient = HttpApiClient.make(Api, {
  baseUrl: "http://localhost:3000",
});

const program = Effect.gen(function* () {
  const client = yield* HttpClient;

  const homePageEffect = client.Index.home();
  const aboutPageEffect = client.Index.about();

  const results = yield* Effect.all([homePageEffect, aboutPageEffect], {
    concurrency: 2,
  });
  yield* Effect.forEach(results, Console.log);
}).pipe(Effect.catchAll(Console.log));

const runnable = program.pipe(Effect.provide(FetchHttpClient.layer));

Effect.runPromiseExit(runnable);
