"use client";
import Link from "next/link";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useMemo, useState } from "react";

type ContStatus = "aberta" | "em_analise" | "aceita" | "rejeitada";
type Contestacao = {
  id: string;
  protocolo: string;
  vistoriaId: string;
  imovel: string;
  autor: string;
  status: ContStatus;
  criada_em: string; // ISO
};

const ANCHOR_TS = new Date("2025-06-01T12:00:00Z").getTime();
const MOCK_CONTESTACOES: Contestacao[] = Array.from({ length: 26 }).map((_, i) => {
  const statuses: ContStatus[] = ["aberta", "em_analise", "aceita", "rejeitada"];
  return {
    id: (5000 + i).toString(),
    protocolo: `CT-${(10000 + i).toString()}`,
    vistoriaId: (1000 + (i % 12)).toString(),
    imovel: `Imóvel ${i + 1} - Av. Modelo ${i + 50}`,
    autor: ["Inquilino", "Proprietário", "Corretor"][i % 3],
    status: statuses[i % 4],
    criada_em: new Date(ANCHOR_TS - i * 86400000).toISOString(),
  } satisfies Contestacao;
});

export default function ContestoesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"todos" | ContStatus>("todos");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Contestacao[]>(MOCK_CONTESTACOES);
  const [toDelete, setToDelete] = useState<Contestacao | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return items.filter((c) => {
      const q = `${c.protocolo} ${c.imovel} ${c.autor}`.toLowerCase();
      const matchesQ = q.includes(query.toLowerCase());
      const matchesStatus = status === "todos" ? true : c.status === status;
      return matchesQ && matchesStatus;
    });
  }, [items, query, status]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function statusBadge(s: ContStatus) {
    const tone: Record<ContStatus, "amber" | "blue" | "emerald" | "rose"> = {
      aberta: "amber",
      em_analise: "blue",
      aceita: "emerald",
      rejeitada: "rose",
    };
    const icon: Record<ContStatus, JSX.Element> = {
      aberta: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm1-7V7h-2v8h2Zm0 4v-2h-2v2h2Z" />
        </svg>
      ),
      em_analise: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M10 3a7 7 0 1 1 5.29 11.6l4.56 4.55-1.42 1.42-4.55-4.56A7 7 0 0 1 10 3Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
        </svg>
      ),
      aceita: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      ),
      rejeitada: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59Z" />
        </svg>
      ),
    };
    return (
      <StatusBadge tone={tone[s]} leftIcon={icon[s]}>
        {s.replace("_", " ")}
      </StatusBadge>
    );
  }

  function askRemove(c: Contestacao) {
    setToDelete(c);
  }
  function confirmRemove() {
    if (!toDelete) return;
    const id = toDelete.id;
    setItems((prev) => prev.filter((p) => p.id !== id));
    setToDelete(null);
    setToast({ message: "Contestação excluída", tone: "success" });
    setTimeout(() => setToast(null), 2000);
  }
  function cancelRemove() {
    setToDelete(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Contestações</h1>
          <p className="text-sm text-muted-foreground">Lista com filtros e paginação (mock)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Buscar por protocolo, imóvel ou autor"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-md border border-input bg-background"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
          className="h-9 px-2 rounded-md border border-input bg-background"
        >
          <option value="todos">Todos status</option>
          <option value="aberta">Aberta</option>
          <option value="em_analise">Em análise</option>
          <option value="aceita">Aceita</option>
          <option value="rejeitada">Rejeitada</option>
        </select>
        <div className="flex items-center justify-end text-sm text-muted-foreground">{total} resultados</div>
      </div>

      <div className="overflow-auto rounded-lg border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-3 py-2.5">Protocolo</th>
              <th className="text-left font-medium px-3 py-2.5">Imóvel</th>
              <th className="text-left font-medium px-3 py-2.5">Autor</th>
              <th className="text-left font-medium px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center text-sm text-muted-foreground" colSpan={5}>
                  Nenhum registro encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              pageItems.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{c.protocolo}</td>
                  <td className="px-3 py-2">{c.imovel}</td>
                  <td className="px-3 py-2">{c.autor}</td>
                  <td className="px-3 py-2">{statusBadge(c.status)}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/contestoes/${c.id}`} className="px-2 py-1.5 rounded-md border border-border hover:bg-muted/30 inline-block" aria-label={`Abrir contestação ${c.protocolo}`}>Abrir</Link>
                      <button onClick={() => askRemove(c)} className="px-2 py-1.5 rounded-md border border-rose-500/40 text-rose-400 hover:bg-rose-500/10" aria-label={`Excluir contestação ${c.protocolo}`}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-md border border-border disabled:opacity-50" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
          <button className="px-3 py-1.5 rounded-md border border-border disabled:opacity-50" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Próxima</button>
        </div>
      </div>

      {toDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={cancelRemove}>
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-muted-foreground mb-4">Tem certeza que deseja excluir "{toDelete.protocolo}"?</p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 rounded-md border border-border" onClick={cancelRemove}>Cancelar</button>
              <button className="px-3 py-2 rounded-md border border-rose-500/40 text-rose-400 hover:bg-rose-500/10" onClick={confirmRemove}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed right-4 top-4 z-50 rounded-md px-3 py-2 text-sm shadow-md border ${toast.tone === "success" ? "bg-emerald-600 text-white border-emerald-500" : "bg-rose-600 text-white border-rose-500"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
