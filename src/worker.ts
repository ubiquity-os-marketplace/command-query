import { Value } from "@sinclair/typebox/value";
import { run } from "./run";
import { Env } from "./types/env";
import { commandQueryUserScheme } from "./types/plugin-input";
import manifest from "../manifest.json";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method === "GET") {
        const url = new URL(request.url);
        console.log(`Request url`, url);
        if (url.pathname === "manifest.json") {
          return new Response(JSON.stringify(manifest), {
            headers: { "content-type": "application/json" },
          });
        } else {
          return new Response(JSON.stringify(url), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
      }
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: `Only POST requests are supported.` }), {
          status: 405,
          headers: { "content-type": "application/json", Allow: "POST" },
        });
      }
      const contentType = request.headers.get("content-type");
      if (contentType !== "application/json") {
        return new Response(JSON.stringify({ error: `Error: ${contentType} is not a valid content type` }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }
      const webhookPayload = await request.json();
      webhookPayload.settings = Value.Decode(commandQueryUserScheme, Value.Default(commandQueryUserScheme, webhookPayload.settings));
      await run(webhookPayload, env);
      return new Response(JSON.stringify("OK"), { status: 200, headers: { "content-type": "application/json" } });
    } catch (error) {
      return handleUncaughtError(error);
    }
  },
};

function handleUncaughtError(error: unknown) {
  console.error(error);
  const status = 500;
  return new Response(JSON.stringify({ error }), { status: status, headers: { "content-type": "application/json" } });
}
