import { createClient } from "@supabase/supabase-js";
import { Logs } from "@ubiquity-os/ubiquity-os-logger";
import { CommanderError } from "commander";
import { Octokit } from "@octokit/rest";
import { createAdapters } from "./adapters";
import { CommandParser } from "./handlers/command-parser";
import { Context } from "./types/context";
import { Database } from "./types/database";
import { Env } from "./types/env";
import { PluginInputs } from "./types/plugin-input";

export async function run(inputs: PluginInputs, env: Env) {
  const octokit = new Octokit({ auth: inputs.authToken });
  const logger = new Logs("verbose");
  if (inputs.eventName !== "issue_comment.created") {
    logger.info(`Unsupported event ${inputs.eventName}, skipping.`);
    return;
  }
  const args = inputs.eventPayload.comment.body.trim().split(/\s+/);
  const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_KEY);
  const context = {
    eventName: inputs.eventName,
    payload: inputs.eventPayload,
    config: inputs.settings,
    octokit,
    logger,
    adapters: {} as unknown as ReturnType<typeof createAdapters>,
  } as Context;
  context.adapters = createAdapters(supabase, context);
  const commandParser = new CommandParser(context);
  try {
    await commandParser.parse(args);
  } catch (e) {
    if (e instanceof CommanderError) {
      if (e.code !== "commander.unknownCommand") {
        context.logger.fatal("Commander error", { e });
        await octokit.issues.createComment({
          body: `\`\`\`
          Failed to run command-query-user.
          ${e.message}

          ${commandParser.helpInformation()}
          \`\`\``,
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          issue_number: context.payload.issue.number,
        });
      }
    } else {
      context.logger.error("error", { e });
      throw e;
    }
  }
}
