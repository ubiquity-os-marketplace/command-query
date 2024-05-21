import { Context } from "../types/context";

export async function queryUser(context: Context, username: string) {
  const { octokit, payload } = context;
  try {
    await octokit.issues.createComment({
      body: `Hello ${username}`,
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.issue.number,
    });
  } catch (e) {
    console.error("Could not query user.", e);
  }
}
