import { CommanderError } from "@commander-js/extra-typings";
import { Octokit } from "@octokit/rest";
import { CommandParser } from "./handlers/command-parser";
import { Context } from "./types/context";
import { Env } from "./types/env";
import { PluginInputs } from "./types/plugin-input";

export async function run(inputs: PluginInputs, env: Env) {
  if (inputs.eventName !== "issue_comment.created") {
    console.warn(`Unsupported event ${inputs.eventName}, skipping.`);
    return;
  }
  const args = inputs.eventPayload.comment.body.trim().split(/\s+/);
  try {
    const octokit = new Octokit({ auth: env.GITHUB_TOKEN });
    const commandParser = new CommandParser({ octokit, payload: inputs.eventPayload } as Context);
    await commandParser.parse(args);
  } catch (e) {
    if (e instanceof CommanderError) {
      if (e.code !== "commander.unknownCommand") {
        // post error
        console.error(e);
      }
    } else {
      throw e;
    }
  }
}
