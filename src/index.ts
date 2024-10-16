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
  async fetch(request: Request, env: Env, context: ExecutionContext) {
    function createPluginWithEnv(environment: Env) {
      return createPlugin<PluginSettings, Env, SupportedEvents>(
        (context) => {
          const supabase = createClient<Database>(environment.SUPABASE_URL, environment.SUPABASE_KEY);
          return run({ ...context, adapters: createAdapters(supabase, context) });
        },
        // @ts-expect-error strings cannot be assigned to events
        manifest,
        { kernelPublicKey: env.KERNEL_PUBLIC_KEY, settingsSchema: pluginSettingsSchema, envSchema: envSchema }
      );
    }

    const plugin = await createPluginWithEnv(env);
    return plugin.fetch(request, env, context);
  },
};
