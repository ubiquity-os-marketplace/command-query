import { StaticDecode, Type as T } from "@sinclair/typebox";

export const pluginSettingsSchema = T.Object({
  /**
   * Allows any user to query anyone else. If false, only org members can query others.
   */
  allowPublicQuery: T.Optional(T.Boolean({ default: true })),
});

export type PluginSettings = StaticDecode<typeof pluginSettingsSchema>;
