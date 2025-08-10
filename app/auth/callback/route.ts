import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServer();

  // Troca o código de OAuth por sessão e grava cookies HTTP-only
  const { error } = await (supabase.auth as any).exchangeCodeForSession(request);

  if (error) {
    // Em caso de erro, volta para /login com mensagem simples
    const url = new URL("/login", request.url);
    url.searchParams.set("error", error.message);
    return NextResponse.redirect(url);
  }

  // Sucesso: envia para dashboard
  const redirectTo = new URL("/dashboard", request.url);
  return NextResponse.redirect(redirectTo);
}
