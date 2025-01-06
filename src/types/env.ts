import { StaticDecode, Type as T } from "@sinclair/typebox";
import { LOG_LEVEL } from "@ubiquity-os/ubiquity-os-logger";

export const envSchema = T.Object({
  SUPABASE_URL: T.String(),
  SUPABASE_KEY: T.String(),
  KERNEL_PUBLIC_KEY: T.Optional(T.String()),
  LOG_LEVEL: T.Enum(LOG_LEVEL, { default: LOG_LEVEL.INFO }),
  CLOUDFLARE_WORKER_NAME: T.Optional(T.String()),
});

export type Env = StaticDecode<typeof envSchema>;
