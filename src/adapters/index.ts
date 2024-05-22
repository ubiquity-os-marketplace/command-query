import { SupabaseClient } from "@supabase/supabase-js";
import { Context } from "../types/context";

export function createAdapters(supabaseClient: SupabaseClient, context: Context) {
  void context;
  return {
    supabase: {
      access: {
        async getAccess(userId: number) {
          const { data } = await supabaseClient.from("users").select().eq("user_id", userId).single();
          return data;
        },
      },
      wallet: {
        async getWallet(userId: number) {
          const { data } = await supabaseClient.from("users").select("*, wallets(address)").eq("id", userId).single();
          return data;
        },
      },
    },
  };
}
