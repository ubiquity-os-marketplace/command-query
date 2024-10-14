import { EmitterWebhookEvent as WebhookEvent, EmitterWebhookEventName as WebhookEventName } from "@octokit/webhooks";
import { LOG_LEVEL } from "@ubiquity-os/ubiquity-os-logger";
import { StandardValidator } from "typebox-validators";
import { SupportedEvents } from "./context";
import { StaticDecode, Type as T } from "@sinclair/typebox";

export interface PluginInputs<T extends WebhookEventName = SupportedEvents> {
  stateId: string;
  eventName: T;
  eventPayload: WebhookEvent<T>["payload"];
  settings: PluginSettings;
  authToken: string;
  ref: string;
}

export const pluginSettingsSchema = T.Object({
  /**
   * Allows any user to query anyone else. If false, only org members can query others.
   */
  allowPublicQuery: T.Optional(T.Boolean({ default: true })),
  logLevel: T.Optional(T.Enum(LOG_LEVEL, { default: LOG_LEVEL.INFO })),
});

export const commandQueryUserSchemaValidator = new StandardValidator(pluginSettingsSchema);

export type PluginSettings = StaticDecode<typeof pluginSettingsSchema>;
