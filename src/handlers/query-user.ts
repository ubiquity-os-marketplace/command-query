import { Context } from "../types/context";

async function checkUserAccess(context: Context, username: string) {
  const { octokit, payload } = context;
  console.log(JSON.stringify(payload, null, 2));
  if (!payload.comment.user?.name) {
    throw new Error("Missing User from payload, cannot check for collaborator status.");
  }
  const { status } = await octokit.repos.checkCollaborator({
    username: payload.comment.user.name,
    repo: payload.repository.name,
    owner: payload.repository.owner.login,
  });
  console.log("status", status);
  if (status !== 204) {
    await context.logger.fatal(`User ${payload.comment.user.name} cannot request user ${username} as it is not a collaborator.`);
    return false;
  }
  return true;
}

export async function queryUser(context: Context, username: string) {
  const {
    octokit,
    payload,
    adapters: { supabase },
    config,
  } = context;
  const body: string[] = [];
  try {
    const {
      data: { id },
    } = await octokit.users.getByUsername({
      username,
    });
    if (!config.allowPublicQuery && !(await checkUserAccess(context, username))) {
      return;
    }
    const access = await supabase.access.getAccess(id);
    const wallet = await supabase.wallet.getWallet(id);
    if (!access && !wallet) {
      body.push(`\`\`\`
User information for ${username} was not found.
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
    await octokit.issues.createComment({
      body: body.join("\n"),
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.issue.number,
    });
  } catch (e) {
    await context.logger.fatal(`Could not query user ${username}.`, e);
  }
}
