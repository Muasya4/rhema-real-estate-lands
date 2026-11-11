import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseProjectUrl,
  hasLegacySupabaseRole,
  SupabaseConfigurationError,
} from "./config";

export function createSupabaseServiceClient() {
  const key = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!key) {
    throw new SupabaseConfigurationError(
      "Missing SUPABASE_SECRET_KEY. Add the development project's secret key to your local .env.local file.",
    );
  }

  const isSecretKey = /^sb_secret_[A-Za-z0-9_-]+$/.test(key);

  if (!isSecretKey && !hasLegacySupabaseRole(key, "service_role")) {
    throw new SupabaseConfigurationError(
      "SUPABASE_SECRET_KEY must be a Supabase secret key or legacy service_role key.",
    );
  }

  return createClient(getSupabaseProjectUrl(), key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
