import { createSupabaseServer } from "@/lib/supabase/server";

export type UserClaims = {
  userId: string;
  email?: string | null;
  empresaId?: string | null;
  role?: string | null;
};

export async function getSessionAndClaims() {
  // If envs are missing, skip Supabase calls to avoid build/runtime errors
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { session: null, claims: null } as const;
  }

  const supabase = createSupabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { session: null, claims: null } as const;

  const jwt: any = session.user.user_metadata || {};
  const tokenClaims = (session as any).access_token
    ? parseJwt((session as any).access_token)
    : {};

  const empresaId =
    tokenClaims?.empresa_id ||
    jwt?.empresa_id ||
    tokenClaims?.user_metadata?.empresa_id ||
    tokenClaims?.app_metadata?.empresa_id ||
    null;

  const role = tokenClaims?.role || jwt?.role || null;

  const claims: UserClaims = {
    userId: session.user.id,
    email: session.user.email,
    empresaId,
    role,
  };

  return { session, claims } as const;
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload);
  } catch (e) {
    return {} as any;
  }
}
