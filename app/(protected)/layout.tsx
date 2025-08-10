import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionAndClaims } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { session, claims } = await getSessionAndClaims();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="hidden md:block border-r border-border bg-card/50">
        <div className="p-4 text-xl font-semibold">Grifo</div>
        <nav className="px-2 space-y-1 text-sm">
          <a className="block px-3 py-2 hover:bg-muted/20 rounded-md" href="/dashboard">Dashboard</a>
          <a className="block px-3 py-2 hover:bg-muted/20 rounded-md" href="/usage">Usage</a>
          <a className="block px-3 py-2 hover:bg-muted/20 rounded-md" href="/vistorias">Vistorias</a>
          <a className="block px-3 py-2 hover:bg-muted/20 rounded-md" href="/imoveis">Imóveis</a>
          <a className="block px-3 py-2 hover:bg-muted/20 rounded-md" href="/contestoes">Contestações</a>
          <a className="block px-3 py-2 hover:bg-muted/20 rounded-md" href="/usuarios">Usuários</a>
          <a className="block px-3 py-2 hover:bg-muted/20 rounded-md" href="/empresas">Empresas</a>
          <a className="block px-3 py-2 hover:bg-muted/20 rounded-md" href="/perfil">Perfil</a>
        </nav>
        <div className="px-4 py-3 text-xs text-muted-foreground mt-auto">
          <div>Empresa: {claims?.empresaId ?? "-"}</div>
          <div>Role: {claims?.role ?? "-"}</div>
        </div>
      </aside>
      <main className="bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Portal Web Grifo Vistorias</div>
          <form action="/logout" method="post">
            <button type="submit" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90">
              Logout
            </button>
          </form>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
