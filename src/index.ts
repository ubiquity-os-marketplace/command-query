import { createClient } from "@supabase/supabase-js";
import { createPlugin } from "@ubiquity-os/ubiquity-os-kernel";
import { ExecutionContext } from "hono";
import manifest from "../manifest.json";
import { createAdapters } from "./adapters";
import { run } from "./run";
import { SupportedEvents } from "./types/context";
import { Database } from "./types/database";
import { Env } from "./types/env";
import { PluginSettings } from "./types/plugin-input";

function createPluginWithEnv(env: Record<string, string>) {
  return createPlugin<PluginSettings, Env, SupportedEvents>(
    (context) => {
      const supabase = createClient<Database>(context.env.SUPABASE_URL, context.env.SUPABASE_KEY);
      return run({ ...context, adapters: createAdapters(supabase, context) });
    },
    // @ts-expect-error strings cannot be assigned to events
    manifest,
    { kernelPublicKey: env.KERNEL_PUBLIC_KEY }
  );
}

export default {
  async fetch(request: Request, env: Env, context: ExecutionContext) {
    const plugin = await createPluginWithEnv(env);
    return plugin.fetch(request, env, context);
  },
};
