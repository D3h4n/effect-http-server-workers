import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "@effect/platform";
import { Schema } from "effect";

export class ApiError extends Schema.TaggedError<ApiError>()("ApiError", {
  msg: Schema.String,
}) {}

export default class Api extends HttpApi.make("Api").add(
  HttpApiGroup.make("Index")
    .add(
      HttpApiEndpoint.get("home", "/")
        .addSuccess(
          Schema.String.pipe(
            HttpApiSchema.withEncoding({
              kind: "Text",
              contentType: "text/html",
            }),
          ),
        )
        .addError(
          ApiError.pipe(
            HttpApiSchema.withEncoding({
              kind: "Json",
              contentType: "application/json",
            }),
          ),
        ),
    )
    .add(
      HttpApiEndpoint.get("about", "/about")
        .addSuccess(
          Schema.String.pipe(
            HttpApiSchema.withEncoding({
              kind: "Text",
              contentType: "text/html",
            }),
          ),
        )
        .addError(
          ApiError.pipe(
            HttpApiSchema.withEncoding({
              kind: "Json",
              contentType: "application/json",
            }),
          ),
        ),
    )
    .add(HttpApiEndpoint.get("catchAll", "/*"))
    .addError(
      Schema.String.pipe(
        HttpApiSchema.withEncoding({
          kind: "Text",
          contentType: "text/html",
        }),
      ),
      { status: 404 },
    ),
) {}
