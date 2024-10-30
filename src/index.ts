import { createClient } from "@supabase/supabase-js";
import { createPlugin } from "@ubiquity-os/ubiquity-os-kernel";
import { ExecutionContext } from "hono";
import manifest from "../manifest.json";
import { createAdapters } from "./adapters";
import { run } from "./run";
import { SupportedEvents } from "./types/context";
import { Database } from "./types/database";
import { Env, envSchema } from "./types/env";
import { PluginSettings, pluginSettingsSchema } from "./types/plugin-input";

export default {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext) {
    console.log(
      `https://dash.cloudflare.com/${env.CLOUDFLARE_ACCOUNT_ID}/workers/services/view/${env.CLOUDFLARE_WORKER_NAME}/production/observability/logs?granularity=0&time=%7B"type"%3A"absolute"%2C"to"%3A${Date.now() + 60000}%2C"from"%3A${Date.now()}%7D`
    );
    return createPlugin<PluginSettings, Env, SupportedEvents>(
      (context) => {
        const supabase = createClient<Database>(context.env.SUPABASE_URL, context.env.SUPABASE_KEY);
        return run({ ...context, adapters: createAdapters(supabase, context) });
      },
      // @ts-expect-error strings cannot be assigned to events
      manifest,
      { kernelPublicKey: env.KERNEL_PUBLIC_KEY, settingsSchema: pluginSettingsSchema, envSchema: envSchema }
    ).fetch(request, env, executionContext);
  },
};
