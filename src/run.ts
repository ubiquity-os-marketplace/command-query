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
  const octokit = new Octokit({ auth: env.GITHUB_TOKEN });
  const context = { octokit, payload: inputs.eventPayload } as Context;
  try {
    const commandParser = new CommandParser(context);
    await commandParser.parse(args);
  } catch (e) {
    if (e instanceof CommanderError) {
      if (e.code !== "commander.unknownCommand") {
        // post error
        console.error(e);
        await octokit.issues.createComment({
          body: `${e}`,
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          issue_number: context.payload.issue.number,
        });
      }
    } else {
      throw e;
    }
  }
}
