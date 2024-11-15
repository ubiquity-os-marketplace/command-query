import { CommanderError } from "commander";
import { CommandParser } from "./handlers/command-parser";
import { Context } from "./types/context";
import { queryUser } from "./handlers/query-user";

export async function run(context: Context) {
  const { octokit, logger, eventName, payload, command } = context;
  if (command) {
    await queryUser(context, command.parameters.username);
    return;
  }
  if (eventName !== "issue_comment.created") {
    logger.info(`Unsupported event ${eventName}, skipping.`);
    return;
  }
  const args = payload.comment.body.trim().split(/\s+/);
  const commandParser = new CommandParser(context);
  try {
    await commandParser.parse(args);
  } catch (e) {
    if (e instanceof CommanderError) {
      if (e.code !== "commander.unknownCommand") {
        context.logger.fatal("Commander error", { e });
        await octokit.rest.issues.createComment({
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
  return { message: "ok" };
}
