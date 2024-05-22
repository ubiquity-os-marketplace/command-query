import { CommanderError } from "commander";
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
  const commandParser = new CommandParser(context);
  try {
    await commandParser.parse(args);
  } catch (e) {
    console.log("error", e);
    if (e instanceof CommanderError) {
      if (e.code !== "commander.unknownCommand") {
        console.error(e);
        console.log("posting!");
        await octokit.issues.createComment({
          body: `\`\`\`
Failed to run command-query-user.
${e}

${commandParser.helpInformation()}
\`\`\``,
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
