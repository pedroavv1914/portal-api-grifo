"use client";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const handleLogin = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-[0_0_12px_#0006]">
        <h1 className="text-2xl font-semibold mb-2">Entrar</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Acesse com sua conta Google para continuar.
        </p>
        <button
          onClick={handleLogin}
          className="w-full rounded-md bg-primary text-primary-foreground py-2.5 font-medium hover:opacity-90"
        >
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
