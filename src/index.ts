import { createClient } from "@supabase/supabase-js";
import { createPlugin } from "@ubq-meniole/plugin-sdk";
import { ExecutionContext } from "hono";
import manifest from "../manifest.json";
import { createAdapters } from "./adapters";
import { run } from "./run";
import { SupportedEvents } from "./types/context";
import { Database } from "./types/database";
import { Env, envSchema } from "./types/env";
import { PluginSettings, pluginSettingsSchema } from "./types/plugin-input";
import { Command } from "./types/command";
import { Manifest } from "@ubq-meniole/plugin-sdk/manifest";

export default {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext) {
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
