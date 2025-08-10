import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/supabase-js";

// Reads URL and ANON KEY from env (set in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseServer() {
  const cookieStore = cookies();
  const hdrs = headers();

  const client = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        try {
          return cookieStore.get(name)?.value;
        } catch {
          return undefined;
        }
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          /* no-op on server */
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          /* no-op */
        }
      },
    },
    global: {
      headers: {
        "x-forwarded-host": hdrs.get("x-forwarded-host") || undefined,
        "x-forwarded-proto": hdrs.get("x-forwarded-proto") || undefined,
      },
    },
  });

  return client;
}
