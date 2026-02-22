import { Context } from "../types/context";

async function checkUserAccess(context: Context, username: string) {
  const { octokit, payload } = context;
  if (!payload.comment.user?.login) {
    throw new Error("Missing User Login from payload, cannot check for collaborator status.");
  }
  try {
    await octokit.rest.repos.checkCollaborator({
      username: payload.comment.user.login,
      repo: payload.repository.name,
      owner: payload.repository.owner.login,
    });
  } catch (e) {
    if (!!e && typeof e === "object" && "status" in e && e.status === 404) {
      throw context.logger.fatal(`User @${payload.comment.user.login} cannot request user ${username} as it is not a collaborator.`);
    }
    throw e;
  }
  return true;
}

function normalizeUsername(username: string) {
  return username.startsWith("@") ? username.slice(1) : username;
}

export async function queryUser(context: Context, username: string) {
  const {
    octokit,
    adapters: { supabase },
    config,
    commentHandler,
  } = context;
  const normalizedUsername = normalizeUsername(username);
  const body: string[] = [];
  try {
    const {
      data: { id },
    } = await octokit.rest.users.getByUsername({
      username: normalizedUsername,
    });
    if (!config.allowPublicQuery && !(await checkUserAccess(context, normalizedUsername))) {
      return;
    }
    const access = await supabase.access.getAccess(id);
    const wallet = await supabase.wallet.getWallet(id);
    if (!access && !wallet) {
      body.push(`\`\`\`
User information for ${normalizedUsername} was not found.
\`\`\``);
    } else {
      body.push(`
| Property | Value |
|----------|-------|`);
      if (wallet) {
        body.push(`| Wallet | ${wallet.address} |`);
      }
      if (access) {
        body.push(`| Access | \`\`\`${Array.isArray(access.labels) ? access.labels.join(", ") : JSON.stringify(access.labels, null, 2)}\`\`\` |`);
      }
    }
    await commentHandler.postComment(context, context.logger.ok(body.join("\n")), { raw: true, updateComment: true });
  } catch (e) {
    throw context.logger.fatal(`Could not query user ${normalizedUsername}.`, { e });
  }
}
