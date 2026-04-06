import { createClient } from "@supabase/supabase-js";
import { createPlugin } from "@ubiquity-os/plugin-sdk";
import { Manifest } from "@ubiquity-os/plugin-sdk/manifest";
import type { ExecutionContext } from "hono";
import manifest from "../manifest.json" with { type: "json" };
import { createAdapters } from "./adapters/index.ts";
import { run } from "./run.ts";
import { Command } from "./types/command.ts";
import { SupportedEvents } from "./types/context.ts";
import { Database } from "./types/database.ts";
import { Env, envSchema } from "./types/env.ts";
import { PluginSettings, pluginSettingsSchema } from "./types/plugin-input.ts";

export default {
  async fetch(request: Request, env: Env, executionContext?: ExecutionContext) {
    return createPlugin<PluginSettings, Env, Command, SupportedEvents>(
      (context) => {
        const supabase = createClient<Database>(context.env.SUPABASE_URL, context.env.SUPABASE_KEY);
        return run({ ...context, adapters: createAdapters(supabase, context) });
      },
      manifest as Manifest,
      { kernelPublicKey: env.KERNEL_PUBLIC_KEY, settingsSchema: pluginSettingsSchema, envSchema: envSchema }
    ).fetch(request, env, executionContext);
  },
};
