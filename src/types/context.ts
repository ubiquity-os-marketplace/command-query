import { Context as PluginContext } from "@ubiquity-os/plugin-sdk";
import { createAdapters } from "../adapters/index.ts";
import { Env } from "./env.ts";
import { PluginSettings } from "./plugin-input.ts";
import { Command } from "./command.ts";

export type SupportedEvents = "issue_comment.created";

export type Context = PluginContext<PluginSettings, Env, Command, SupportedEvents> & {
  adapters: ReturnType<typeof createAdapters>;
};
