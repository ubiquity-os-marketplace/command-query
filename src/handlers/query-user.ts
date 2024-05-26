import { Context } from "../types/context";

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
    if (!config.allowPublicQuery) {
      if (!payload.organization || !payload.comment.user?.name) {
        throw new Error("Missing Organization / User from payload, cannot check for organization membership.");
      }
      const { status } = await octokit.orgs.checkMembershipForUser({
        username: payload.comment.user.name,
        org: payload.organization.login,
      });
      // @ts-expect-error Somehow typing seems wrong but according to
      // https://docs.github.com/en/rest/orgs/members?apiVersion=2022-11-28#check-organization-membership-for-a-user--status-codes
      // 204 means the user is part of the Organization
      if (status !== 204) {
        body.push(`\`\`\`User ${username} cannot request another user as it is not member of the organization.\`\`\``);
        await octokit.issues.createComment({
          body: body.join("\n"),
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: payload.issue.number,
        });
        return;
      }
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
        body.push(`| Access | \`\`\`${JSON.stringify({ ...access.multiplier_reason, ...access.labels }, null, 2)}\`\`\` |`);
      }
    }
    await octokit.issues.createComment({
      body: body.join("\n"),
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.issue.number,
    });
  } catch (e) {
    context.logger.fatal("Could not query user.", e);
  }
}
