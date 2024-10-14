import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from "@jest/globals";
import { drop } from "@mswjs/data";
import { run } from "../src/run";
import { CommandContext } from "../src/types/plugin-input";
import { db } from "./__mocks__/db";
import { server } from "./__mocks__/node";
import commentCreatedPayload from "./__mocks__/payloads/comment-created.json";
import usersGet from "./__mocks__/users-get.json";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.mock("@supabase/supabase-js", () => {
  return {
    createClient: jest.fn(() => {
      return {
        from: jest.fn((table: string) => {
          return {
            select: jest.fn(() => {
              return {
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
    expect(
      async () =>
        await run({
          eventName: event,
          ref: "",
          authToken: "",
          stateId: "",
          settings: { allowPublicQuery: true },
          eventPayload: commentCreatedPayload,
        } as unknown as CommandContext)
    ).not.toThrow();
  });

  it("Should ignore invalid command", async () => {
    expect(
      async () =>
        await run({
          eventName: event,
          ref: "",
          authToken: "",
          stateId: "",
          settings: { allowPublicQuery: true },
          eventPayload: {
            ...commentCreatedPayload,
            comment: {
              ...commentCreatedPayload.comment,
              body: "/foobar @ubiquibot",
            },
          },
        } as unknown as CommandContext)
    ).not.toThrow();
  });

  it("Should not throw on invalid arguments", async () => {
    expect(
      async () =>
        await run({
          eventName: event,
          ref: "",
          authToken: "",
          stateId: "",
          settings: { allowPublicQuery: true },
          eventPayload: {
            ...commentCreatedPayload,
            comment: {
              ...commentCreatedPayload.comment,
              body: "/query ubiquibot",
            },
          },
        } as unknown as CommandContext)
    ).not.toThrow();
  });
});
