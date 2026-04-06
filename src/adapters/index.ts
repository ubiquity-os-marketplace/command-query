import { SupabaseClient } from "@supabase/supabase-js";
import { Context } from "../types/context";
import { Database } from "../types/database";

export function createAdapters(supabaseClient: SupabaseClient<Database>, context: Omit<Context, "adapters">) {
  return {
    supabase: {
      access: {
        async getAccess(userId: number) {
          const { data, error } = await supabaseClient.from("access").select("*, users(*)").eq("users.id", userId).single();
          if (error) {
            context.logger.error("Failed to get access for user", error);
            return null;
          }
          return data;
        },
      },
      wallet: {
        async getWallet(userId: number) {
          const { data, error } = await supabaseClient.from("users").select("*, wallets(address)").eq("id", userId).single();
          if (error) {
            context.logger.error("Failed to fetch wallet for user", { userId, postgres: error });
            return null;
          }
          return data.wallets;
        },
      },
    },
  };
}
