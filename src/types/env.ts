import { Type as T, StaticDecode } from "@sinclair/typebox";

export const envSchema = T.Object({
  SUPABASE_URL: T.String(),
  SUPABASE_KEY: T.String(),
  GITHUB_TOKEN: T.String(),
});

export type Env = StaticDecode<typeof envSchema>;
