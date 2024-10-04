import { Type as T, StaticDecode } from "@sinclair/typebox";
import { StandardValidator } from "typebox-validators";

export const envSchema = T.Object({
  SUPABASE_URL: T.String(),
  SUPABASE_KEY: T.String(),
});

export const envConfigValidator = new StandardValidator(envSchema);

export type Env = StaticDecode<typeof envSchema>;
