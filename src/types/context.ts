import { Context } from "@ubiquity-os/ubiquity-os-kernel";
import { createAdapters } from "../adapters";
import { Env } from "./env";
import { PluginSettings } from "./plugin-input";

export type SupportedEvents = "issue_comment.created";

export type CommandContext = Context<PluginSettings, Env, SupportedEvents> & {
  adapters: ReturnType<typeof createAdapters>;
};
