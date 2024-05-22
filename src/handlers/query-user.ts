import { Context } from "../types/context";

export async function queryUser(context: Context, username: string) {
  const {
    octokit,
    payload,
    adapters: { supabase },
  } = context;
  const body: string[] = [];
  try {
    const {
      data: { id },
    } = await octokit.users.getByUsername({
      username,
    });
    const access = await supabase.access.getAccess(id);
    const wallet = await supabase.wallet.getWallet(id);
    if (!access && !wallet) {
      body.push(`\`\`\`
User information for ${username} was not found.
\`\`\``);
    } else {
      body.push(`
| Property | Value |
-----------|--------
`);
      if (wallet) {
        body.push(`
| Wallet | ${wallet.address} |
`);
      }
      if (access) {
        body.push(`
| Access | ${access.multiplier_reason} |
`);
      }
    }
    await octokit.issues.createComment({
      body: body.join(""),
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.issue.number,
    });
  } catch (e) {
    console.error("Could not query user.", e);
  }
}
