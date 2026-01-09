import { CommanderError } from "commander";
import { CommandParser } from "./handlers/command-parser";
import { Context } from "./types/context";
import { queryUser } from "./handlers/query-user";

export async function run(context: Context) {
  const { logger, eventName, payload, command, commentHandler } = context;
  if (command) {
    await queryUser(context, command.parameters.username);
    return;
  }
  if (eventName !== "issue_comment.created") {
    logger.debug(`Unsupported event ${eventName}, skipping.`);
    return;
  }
  const args = payload.comment.body.trim().split(/\s+/);
  const commandParser = new CommandParser(context);
  try {
    await commandParser.parse(args);
  } catch (e) {
    if (e instanceof CommanderError) {
      if (e.code !== "commander.unknownCommand") {
        await commentHandler.postComment(
          context,
          context.logger.warn(
            `\`\`\`
Failed to run command-query-user.
${e.message}

${commandParser.helpInformation()}
\`\`\``,
            { e }
          )
        );
      }
    } else {
      context.logger.fatal("error", { e });
      throw e;
    }
  }
  return { message: "ok" };
}
