import { Value } from "@sinclair/typebox/value";
import { Env, envConfigValidator, envSchema } from "../types/env";
import { CommandQuerySettings, commandQueryUserSchema, commandQueryUserSchemaValidator } from "../types/plugin-input";

export function validateAndDecodeSchemas(env: Env, rawSettings: object) {
  const settings = Value.Default(commandQueryUserSchema, rawSettings) as CommandQuerySettings;

  if (!commandQueryUserSchemaValidator.test(settings)) {
    const errorDetails: object[] = [];
    for (const error of commandQueryUserSchemaValidator.errors(settings)) {
      const errorMessage = { path: error.path, message: error.message, value: error.value };
      console.error(errorMessage);
      errorDetails.push(errorMessage);
    }
    return new Response(JSON.stringify({ message: `Bad Request: the settings are invalid.`, errors: errorDetails }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const decodedSettings = Value.Decode(commandQueryUserSchema, settings);

  if (!envConfigValidator.test(env)) {
    const errorDetails: object[] = [];
    for (const error of envConfigValidator.errors(env)) {
      const errorMessage = { path: error.path, message: error.message, value: error.value };
      console.error(errorMessage);
      errorDetails.push(errorMessage);
    }
    return new Response(JSON.stringify({ message: `Bad Request: the environment is invalid.`, errors: errorDetails }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const decodedEnv = Value.Decode(envSchema, env);

  return { decodedEnv, decodedSettings };
}
