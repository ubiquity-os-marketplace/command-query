import { Context as PluginContext } from "@ubiquity-os/plugin-sdk";
import { createAdapters } from "../adapters/index";
import { Env } from "./env";
import { PluginSettings } from "./plugin-input";
import { Command } from "./command";

export type SupportedEvents = "issue_comment.created";

export type Context = PluginContext<PluginSettings, Env, Command, SupportedEvents> & {
  adapters: ReturnType<typeof createAdapters>;
};
