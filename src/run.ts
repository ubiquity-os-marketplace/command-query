import { Env } from "./types/env";
import { PluginInputs } from "./types/plugin-input";

export async function run(payload: PluginInputs, env: Env) {
  console.log(payload, env);
}
