import { createClient } from "@supabase/supabase-js";
import { createPlugin, Options } from "@ubiquity-os/plugin-sdk";
import { Manifest, resolveRuntimeManifest } from "@ubiquity-os/plugin-sdk/manifest";
import type { ExecutionContext } from "hono";
import { env } from "hono/adapter";
import manifest from "../manifest.json" with { type: "json" };
import { createAdapters } from "./adapters/index";
import { run } from "./run";
import { Command } from "./types/command";
import { SupportedEvents } from "./types/context";
import { Database } from "./types/database";
import { Env, envSchema } from "./types/env";
import { PluginSettings, pluginSettingsSchema } from "./types/plugin-input";

function buildRuntimeManifest(request: Request) {
  const runtimeManifest = resolveRuntimeManifest(manifest as Manifest);
  return {
    ...runtimeManifest,
    homepage_url: new URL(request.url).origin,
  };
}

export default {
  async fetch(request: Request, serverInfo: Record<string, unknown>, executionContext?: ExecutionContext) {
    const runtimeManifest = buildRuntimeManifest(request);
    if (new URL(request.url).pathname === "/manifest.json") {
      return Response.json(runtimeManifest);
    }
    const environment = env<Env>(request as never);
    return createPlugin<PluginSettings, Env, Command, SupportedEvents>(
      (context) => {
        const supabase = createClient<Database>(context.env.SUPABASE_URL, context.env.SUPABASE_KEY);
        return run({ ...context, adapters: createAdapters(supabase, context) });
      },
      runtimeManifest,
      {
        kernelPublicKey: environment.KERNEL_PUBLIC_KEY,
        settingsSchema: pluginSettingsSchema as unknown as Options["settingsSchema"],
        envSchema: envSchema as unknown as Options["envSchema"],
      }
    ).fetch(request, serverInfo, executionContext);
  },
};
