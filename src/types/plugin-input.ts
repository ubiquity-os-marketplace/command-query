import { EmitterWebhookEvent as WebhookEvent, EmitterWebhookEventName as WebhookEventName } from "@octokit/webhooks";
import { SupportedEvents } from "./context";
import { StaticDecode, Type as T } from "@sinclair/typebox";

export interface PluginInputs<T extends WebhookEventName = SupportedEvents> {
  stateId: string;
  eventName: T;
  eventPayload: WebhookEvent<T>["payload"];
  settings: CommandQuerySettings;
  authToken: string;
  ref: string;
}

export const commandQueryUserScheme = T.Object({
  /**
   * Allows any user to query anyone else. If false, only org members can query others.
   */
  allowPublicQuery: T.Boolean({ default: true }),
});

export type CommandQuerySettings = StaticDecode<typeof commandQueryUserScheme>;
