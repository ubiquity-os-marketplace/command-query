import { createClient } from "@supabase/supabase-js";
import { CommanderError } from "commander";
import { Octokit } from "@octokit/rest";
import { createAdapters } from "./adapters";
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
  const octokit = new Octokit({ auth: env.UBIQUIBOT_TOKEN });
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
  const context = {
    eventName: inputs.eventName,
    payload: inputs.eventPayload,
    config: inputs.settings,
    octokit,
    logger: {
      debug(message: unknown, ...optionalParams: unknown[]) {
        console.debug(message, ...optionalParams);
      },
      info(message: unknown, ...optionalParams: unknown[]) {
        console.log(message, ...optionalParams);
      },
      warn(message: unknown, ...optionalParams: unknown[]) {
        console.warn(message, ...optionalParams);
      },
      error(message: unknown, ...optionalParams: unknown[]) {
        console.error(message, ...optionalParams);
      },
      fatal(message: unknown, ...optionalParams: unknown[]) {
        console.error(message, ...optionalParams);
      },
    },
    adapters: {},
  } as Context;
  context.adapters = createAdapters(supabase, context);
  const commandParser = new CommandParser(context);
  try {
    await commandParser.parse(args);
  } catch (e) {
    console.log("error", e);
    if (e instanceof CommanderError) {
      if (e.code !== "commander.unknownCommand") {
        console.error(e);
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
