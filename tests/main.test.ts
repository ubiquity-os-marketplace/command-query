import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from "@jest/globals";
import { run } from "../src/run";
import { PluginInputs } from "../src/types/plugin-input";
import { db } from "./__mocks__/db";
import { server } from "./__mocks__/node";
import commentCreatedPayload from "./__mocks__/payloads/comment-created.json";
import usersGet from "./__mocks__/users-get.json";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("User tests", () => {
  beforeEach(() => {
    for (const item of usersGet) {
      db.users.create(item);
    }
  });

  it("Should run the command", async () => {
    await run(
      {
        eventName: "issue_comment.created",
        ref: "",
        authToken: "",
        stateId: "",
        settings: { allowPublicQuery: true },
        eventPayload: commentCreatedPayload,
      } as PluginInputs,
      { SUPABASE_URL: "", SUPABASE_KEY: "", GITHUB_TOKEN: "" }
    );
  });
});
