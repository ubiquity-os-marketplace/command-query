import { Octokit } from "@octokit/rest";
import { EmitterWebhookEvent as WebhookEvent, EmitterWebhookEventName as WebhookEventName } from "@octokit/webhooks";
import { Logs } from "@ubiquity-os/ubiquity-os-logger";
import { createAdapters } from "../adapters";
import { PluginSettings } from "./plugin-input";

export type SupportedEvents = "issue_comment.created";

export interface Context<T extends WebhookEventName = SupportedEvents> {
  eventName: T;
  payload: WebhookEvent<T>["payload"];
  octokit: InstanceType<typeof Octokit>;
  adapters: ReturnType<typeof createAdapters>;
  config: PluginSettings;
  logger: Logs;
}
