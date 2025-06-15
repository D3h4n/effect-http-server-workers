import { Schema } from "effect";

export class NodeWorkerRequestSchema extends Schema.Struct({
  page: Schema.Literal("home", "about", "404"),
  content: Schema.optionalWith(Schema.NonEmptyString, { exact: true }),
}) {}

export type NodeWorkerRequest = Schema.Schema.Type<
  typeof NodeWorkerRequestSchema
>;

export class NodeWorkerError extends Schema.TaggedError<NodeWorkerError>()(
  "WorkerError",
  { message: Schema.String },
) {}
