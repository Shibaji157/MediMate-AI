import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

/**
 * Creates a server-only Supabase client.
 *
 * IMPORTANT:
 * This client uses the Supabase secret/service-role key.
 * Never import this file into a Client Component.
 * Never expose this key using NEXT_PUBLIC_.
 */
export function createAdminClient(): SupabaseClient {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing."
    );
  }

  adminClient = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  return adminClient;
}