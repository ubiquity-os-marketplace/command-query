import { SupabaseClient } from "@supabase/supabase-js";
import { Context } from "../types/context";

export function createAdapters(supabaseClient: SupabaseClient, context: Context) {
  return {
    supabase: {},
  };
}
