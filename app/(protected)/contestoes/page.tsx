"use client";
import Link from "next/link";
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
  const pageSize = 10;

  const filtered = useMemo(() => {
    return MOCK_CONTESTACOES.filter((c) => {
      const q = `${c.protocolo} ${c.imovel} ${c.autor}`.toLowerCase();
      const matchesQ = q.includes(query.toLowerCase());
      const matchesStatus = status === "todos" ? true : c.status === status;
      return matchesQ && matchesStatus;
    });
  }, [query, status]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function statusBadge(s: ContStatus) {
    const map: Record<ContStatus, string> = {
      aberta: "bg-blue-500/15 text-blue-400",
      em_analise: "bg-amber-500/15 text-amber-400",
      aceita: "bg-emerald-500/15 text-emerald-400",
      rejeitada: "bg-rose-500/15 text-rose-400",
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[s]}`}>{s.replace("_", " ")}</span>;
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
            {pageItems.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-3 py-2">{c.protocolo}</td>
                <td className="px-3 py-2">{c.imovel}</td>
                <td className="px-3 py-2">{c.autor}</td>
                <td className="px-3 py-2">{statusBadge(c.status)}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/contestoes/${c.id}`} className="px-2 py-1.5 rounded-md border border-border hover:bg-muted/30 inline-block">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-muted-foreground">Nenhum resultado para os filtros atuais.</td>
              </tr>
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
    </div>
  );
}
