import { SupabaseClient } from "@supabase/supabase-js";
import { Context } from "../types/context";

export function createAdapters(supabaseClient: SupabaseClient, context: Context) {
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
            context.logger.error("Failed to fetch wallet for user", userId, error);
            return null;
          }
          return data.wallets;
        },
      },
    },
  };
}
