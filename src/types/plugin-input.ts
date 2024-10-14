import { StaticDecode, Type as T } from "@sinclair/typebox";
import { LOG_LEVEL } from "@ubiquity-os/ubiquity-os-logger";

export const pluginSettingsSchema = T.Object({
  /**
   * Allows any user to query anyone else. If false, only org members can query others.
   */
  allowPublicQuery: T.Optional(T.Boolean({ default: true })),
  logLevel: T.Optional(T.Enum(LOG_LEVEL, { default: LOG_LEVEL.INFO })),
});

export type PluginSettings = StaticDecode<typeof pluginSettingsSchema>;
