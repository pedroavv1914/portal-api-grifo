"use client";
import React, { useMemo, useState } from "react";
import KpiCard from "../../../components/ui/KpiCard";
import SectionCard from "../../../components/ui/SectionCard";
import Tooltip from "../../../components/ui/Tooltip";
import { StatusBadge } from "../../../components/ui/StatusBadge";

type VisStatus = "agendada" | "em_andamento" | "concluida" | "contestada";
type VisItem = {
  id: string;
  imovel: string;
  endereco: string;
  corretor: string;
  data: string; // ISO date
  status: VisStatus;
};

// Use a fixed anchor to avoid server/client time drift during hydration
const ANCHOR_TS = new Date("2025-06-01T12:00:00Z").getTime();
const MOCK_DATA: VisItem[] = Array.from({ length: 42 }).map((_, i) => {
  const statuses: VisStatus[] = ["agendada", "em_andamento", "concluida", "contestada"];
  const s = statuses[i % statuses.length];
  return {
    id: (1000 + i).toString(),
    imovel: `Apartamento ${i + 1}`,
    endereco: `Rua Exemplo ${i + 10}, Centro - Cidade/UF`,
    corretor: ["Ana", "Bruno", "Carla", "Diego"][i % 4],
    data: new Date(ANCHOR_TS - i * 86400000).toISOString(),
    status: s,
  } satisfies VisItem;
});

export default function VistoriasPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"todos" | VisStatus>("todos");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return MOCK_DATA.filter((v) => {
      const matchesQuery = `${v.imovel} ${v.endereco} ${v.corretor}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus = status === "todos" ? true : v.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const total = filtered.length;
  const kpiAgendadas = useMemo(() => filtered.filter((v) => v.status === "agendada").length, [filtered]);
  const kpiAndamento = useMemo(() => filtered.filter((v) => v.status === "em_andamento").length, [filtered]);
  const kpiContestadas = useMemo(() => filtered.filter((v) => v.status === "contestada").length, [filtered]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Breadcrumbs */}
      <nav className="text-xs text-muted-foreground" aria-label="breadcrumb">
        <ol className="flex items-center gap-1">
          <li><a href="/dashboard" className="hover:underline">Início</a></li>
          <li aria-hidden className="mx-1">/</li>
          <li aria-current="page" className="text-foreground">Vistorias</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Vistorias</h1>
          <p className="text-sm text-muted-foreground">UI mockada com filtros, paginação e ações</p>
        </div>
        <Tooltip content="Criar nova vistoria (mock)">
          <a
            href="#"
            className="h-9 inline-flex items-center rounded-md border border-border px-3 text-sm hover:bg-muted/30"
            onClick={(e) => e.preventDefault()}
          >
            Nova vistoria
          </a>
        </Tooltip>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Agendadas" value={kpiAgendadas} color="#3b82f6" />
        <KpiCard label="Em andamento" value={kpiAndamento} color="#f59e0b" />
        <KpiCard label="Contestadas" value={kpiContestadas} color="#ef4444" />
      </section>

      {/* Filtros */}
      <SectionCard title="Filtros" subtitle={`${total} resultados`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="col-span-1 md:col-span-2 flex gap-2">
            <input
              placeholder="Buscar por imóvel, endereço ou corretor"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="flex-1 h-9 px-3 rounded-md border border-input bg-background"
            />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
              className="h-9 px-2 rounded-md border border-input bg-background"
            >
              <option value="todos">Todos status</option>
              <option value="agendada">Agendada</option>
              <option value="em_andamento">Em andamento</option>
              <option value="concluida">Concluída</option>
              <option value="contestada">Contestada</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground">{total} resultados</span>
          </div>
        </div>
      </SectionCard>

      {/* Lista */}
      <SectionCard title="Lista de vistorias" subtitle="mock">
        <div className="overflow-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 border-b bg-card/95 text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-card/70">
              <tr>
                <th className="text-left font-medium px-3 py-2.5">Vistoria</th>
                <th className="text-left font-medium px-3 py-2.5">Imóvel</th>
                <th className="text-left font-medium px-3 py-2.5">Corretor</th>
                <th className="text-left font-medium px-3 py-2.5">Data</th>
                <th className="text-left font-medium px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((v) => (
                <tr key={v.id} className="border-t border-border odd:bg-background even:bg-muted/5 hover:bg-muted/20">
                  <td className="px-3 py-2 font-medium">#{v.id}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{v.imovel}</div>
                    <div className="text-muted-foreground text-xs">{v.endereco}</div>
                  </td>
                  <td className="px-3 py-2">{v.corretor}</td>
                  <td className="px-3 py-2">{new Date(v.data).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    {v.status === "agendada" && <StatusBadge tone="blue">Agendada</StatusBadge>}
                    {v.status === "em_andamento" && <StatusBadge tone="amber">Em andamento</StatusBadge>}
                    {v.status === "concluida" && <StatusBadge tone="emerald">Concluída</StatusBadge>}
                    {v.status === "contestada" && <StatusBadge tone="rose">Contestada</StatusBadge>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <a
                      href={`/vistorias/${v.id}`}
                      className="px-2 py-1.5 rounded-md border border-border hover:bg-muted/30"
                    >
                      Abrir
                    </a>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">
                    Nenhum resultado para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-md border border-border disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <button
              className="px-3 py-1.5 rounded-md border border-border disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
