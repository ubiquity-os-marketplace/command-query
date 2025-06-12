import { afterAll, afterEach, beforeAll, beforeEach, describe, it, jest } from "@jest/globals";
import { drop } from "@mswjs/data";
import { Octokit } from "@octokit/rest";
import { Logs } from "@ubiquity-os/ubiquity-os-logger";
import { createAdapters } from "../src/adapters/index";
import { run } from "../src/run";
import { Context } from "../src/types/context";
import { Database } from "../src/types/database";
import { db } from "./__mocks__/db";
import { server } from "./__mocks__/node";
import commentCreatedPayload from "./__mocks__/payloads/comment-created.json";
import usersGet from "./__mocks__/users-get.json";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.unstable_mockModule("@supabase/supabase-js", () => {
  return {
    createClient: jest.fn(() => {
      return {
        from: jest.fn((table: string) => {
          return {
            select: jest.fn(() => {
              return {
                // eslint-disable-next-line sonarjs/no-nested-functions
                eq: jest.fn(() => {
                  return {
                    single: jest.fn(() => {
                      if (table === "users") {
                        return {
                          data: {
                            id: 1,
                            wallets: {
                              address: "0x0",
                            },
                          },
                        };
                      } else if (table === "access") {
                        return {
                          data: {
                            id: 1,
                            multiplier_reason: "Organization member",
                          },
                        };
                      }
                    }),
                  };
                }),
              };
            }),
          };
        }),
      };
    }),
  };
});

const event = "issue_comment.created";

describe("User tests", () => {
  beforeEach(() => {
    drop(db);
    for (const item of usersGet) {
      db.users.create(item);
    }
  });

  it("Should run the command", async () => {
    const context = {
      eventName: event,
      ref: "",
      authToken: "",
      stateId: "",
      config: { allowPublicQuery: true },
      payload: commentCreatedPayload,
      logger: new Logs("debug"),
      adapters: {},
      env: {
        SUPABASE_URL: "",
        SUPABASE_KEY: "",
      },
      octokit: new Octokit(),
      commentHandler: {
        postComment: jest.fn(),
      },
    } as unknown as Context;
    const { createClient } = await import("@supabase/supabase-js");
    context.adapters = createAdapters(createClient<Database>(context.env.SUPABASE_URL, context.env.SUPABASE_KEY), context);
    await expect(run(context)).resolves.not.toThrow();
  });

  it("Should ignore invalid command", async () => {
    await expect(
      run({
        eventName: event,
        ref: "",
        authToken: "",
        stateId: "",
        settings: { allowPublicQuery: true },
        logger: new Logs("debug"),
        adapters: {},
        payload: {
          ...commentCreatedPayload,
          comment: {
            ...commentCreatedPayload.comment,
            body: "/foobar @UbiquityOS",
          },
        },
        env: {
          SUPABASE_URL: "",
          SUPABASE_KEY: "",
        },
        octokit: new Octokit(),
        commentHandler: {
          postComment: jest.fn(),
        },
      } as unknown as Context)
    ).resolves.not.toThrow();
  });

  it("Should not throw on invalid arguments", async () => {
    await expect(
      run({
        eventName: event,
        ref: "",
        authToken: "",
        stateId: "",
        settings: { allowPublicQuery: true },
        logger: new Logs("debug"),
        adapters: {},
        payload: {
          ...commentCreatedPayload,
          comment: {
            ...commentCreatedPayload.comment,
            body: "/query ubiquibot",
          },
        },
        env: {
          SUPABASE_URL: "",
          SUPABASE_KEY: "",
        },
        octokit: new Octokit(),
        commentHandler: {
          postComment: jest.fn(),
        },
      } as unknown as Context)
    ).resolves.not.toThrow();
  });
});
