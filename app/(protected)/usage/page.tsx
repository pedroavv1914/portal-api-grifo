"use client";
import { useMemo, useState } from "react";

type Modulo = "dashboard" | "vistorias" | "imoveis" | "usuarios" | "contestoes" | "empresas" | "pdf";
type Acao = "view" | "create" | "update" | "delete" | "download";

type UsageRow = {
  id: string;
  data: string; // ISO
  modulo: Modulo;
  acao: Acao;
  empresa: string;
  quantidade: number;
};

const ANCHOR_TS = new Date("2025-06-01T12:00:00Z").getTime();

const MODS: Modulo[] = ["dashboard", "vistorias", "imoveis", "usuarios", "contestoes", "empresas", "pdf"];
const ACOES: Acao[] = ["view", "create", "update", "delete", "download"];
const EMPRESAS = ["Grifo Imóveis", "Alpha Realty", "Beta Patrimônio", "Gamma Gestão"]; 

const MOCK_USAGE: UsageRow[] = Array.from({ length: 120 }).map((_, i) => {
  const ts = ANCHOR_TS - i * 86_400_000; // 1 dia de passo
  return {
    id: (9000 + i).toString(),
    data: new Date(ts).toISOString(),
    modulo: MODS[i % MODS.length],
    acao: ACOES[i % ACOES.length],
    empresa: EMPRESAS[i % EMPRESAS.length],
    quantidade: (i % 7) + 1,
  } as UsageRow;
});

export default function UsagePage() {
  const [periodo, setPeriodo] = useState<"7d" | "30d" | "90d">("30d");
  const [modulo, setModulo] = useState<"todos" | Modulo>("todos");
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const days = periodo === "7d" ? 7 : periodo === "30d" ? 30 : 90;
  const since = ANCHOR_TS - (days - 1) * 86_400_000;

  const filtered = useMemo(() => {
    return MOCK_USAGE.filter((r) => {
      const within = new Date(r.data).getTime() >= since;
      const modOk = modulo === "todos" ? true : r.modulo === modulo;
      const text = `${r.modulo} ${r.acao} ${r.empresa}`.toLowerCase();
      const qOk = text.includes(busca.toLowerCase());
      return within && modOk && qOk;
    });
  }, [since, modulo, busca]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);

  function exportCSV() {
    const hdr = ["data", "modulo", "acao", "empresa", "quantidade"];
    const lines = [hdr.join(",")].concat(
      filtered.map((r) => [
        new Date(r.data).toISOString(),
        r.modulo,
        r.acao,
        r.empresa.replaceAll(",", " "),
        r.quantidade.toString(),
      ].join(","))
    );
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usage_${periodo}_${modulo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Uso</h1>
          <p className="text-sm text-muted-foreground">Relatórios e estatísticas (mock)</p>
        </div>
        <button onClick={exportCSV} className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90">Exportar CSV</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select value={periodo} onChange={(e) => { setPeriodo(e.target.value as any); setPage(1); }} className="h-9 px-2 rounded-md border border-input bg-background">
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>
        <select value={modulo} onChange={(e) => { setModulo(e.target.value as any); setPage(1); }} className="h-9 px-2 rounded-md border border-input bg-background">
          <option value="todos">Todos módulos</option>
          {MODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input value={busca} onChange={(e) => { setBusca(e.target.value); setPage(1); }} placeholder="Buscar por empresa/ação" className="h-9 px-3 rounded-md border border-input bg-background" />
        <div className="flex items-center justify-end text-sm text-muted-foreground">{total} registros</div>
      </div>

      <div className="overflow-auto rounded-lg border border-border">
        <table className="min-w-full text-sm">
          <colgroup>
            <col className="w-[120px] bg-muted/20" />
            <col />
            <col />
            <col className="bg-muted/10" />
            <col className="w-[80px]" />
          </colgroup>
          <thead className="sticky top-0 z-10 border-b bg-card/95 text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-card/70">
            <tr>
              <th className="text-left font-medium px-3 py-2.5">Data</th>
              <th className="text-left font-medium px-3 py-2.5 border-l border-border/60">Módulo</th>
              <th className="text-left font-medium px-3 py-2.5 border-l border-border/60">Ação</th>
              <th className="text-left font-medium px-3 py-2.5 border-l border-border/60">Empresa</th>
              <th className="text-right font-medium px-3 py-2.5 border-l border-border/60">Qtd</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border odd:bg-background even:bg-muted/5 hover:bg-muted/20">
                <td className="px-3 py-2 font-mono tabular-nums">{new Date(r.data).toLocaleDateString("pt-BR")}</td>
                <td className="px-3 py-2 capitalize border-l border-border/60">{r.modulo}</td>
                <td className="px-3 py-2 border-l border-border/60">{r.acao}</td>
                <td className="px-3 py-2 border-l border-border/60">{r.empresa}</td>
                <td className="px-3 py-2 text-right font-mono tabular-nums border-l border-border/60">{r.quantidade}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-muted-foreground" aria-live="polite">Sem dados para os filtros atuais.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">Página {current} de {totalPages}</div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-md border border-border disabled:opacity-50" disabled={current <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
          <button className="px-3 py-1.5 rounded-md border border-border disabled:opacity-50" disabled={current >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Próxima</button>
        </div>
      </div>
    </div>
  );
}
