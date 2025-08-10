"use client";
// Supabase removed. Placeholder login that goes to dashboard.

export default function LoginPage() {
  const handleLogin = async () => {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-[0_0_12px_#0006]">
        <h1 className="text-2xl font-semibold mb-2">Entrar</h1>
        <p className="text-sm text-muted-foreground mb-6">Autenticação desativada temporariamente.</p>
        <button
          onClick={handleLogin}
          className="w-full rounded-md bg-primary text-primary-foreground py-2.5 font-medium hover:opacity-90"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
