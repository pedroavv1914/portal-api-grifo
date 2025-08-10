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
  const [selected, setSelected] = useState<Set<string>>(new Set());
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
  const pageIds = useMemo(() => pageItems.map((v) => v.id), [pageItems]);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

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
        {/* Quick chips */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs" aria-label="Filtros rápidos por status">
          <button className={`px-2 py-1 rounded-md border ${status === "todos" ? "bg-muted/30" : "hover:bg-muted/20"}`} onClick={() => { setStatus("todos"); setPage(1); }}>Todos</button>
          <button className={`px-2 py-1 rounded-md border ${status === "agendada" ? "bg-blue-500/15 border-blue-500/30 text-blue-300" : "hover:bg-muted/20"}`} onClick={() => { setStatus("agendada"); setPage(1); }}>Agendadas</button>
          <button className={`px-2 py-1 rounded-md border ${status === "em_andamento" ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : "hover:bg-muted/20"}`} onClick={() => { setStatus("em_andamento"); setPage(1); }}>Em andamento</button>
          <button className={`px-2 py-1 rounded-md border ${status === "concluida" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "hover:bg-muted/20"}`} onClick={() => { setStatus("concluida"); setPage(1); }}>Concluídas</button>
          <button className={`px-2 py-1 rounded-md border ${status === "contestada" ? "bg-rose-500/15 border-rose-500/30 text-rose-300" : "hover:bg-muted/20"}`} onClick={() => { setStatus("contestada"); setPage(1); }}>Contestadas</button>
        </div>
      </SectionCard>

      {/* Lista */}
      <SectionCard title="Lista de vistorias" subtitle="mock">
        {/* Bulk actions toolbar */}
        <div className="mb-2 flex items-center justify-between text-sm">
          <div className="text-muted-foreground">{selected.size} selecionada(s)</div>
          <div className="flex gap-2">
            <button className="px-2 py-1.5 rounded-md border border-border disabled:opacity-50" disabled={selected.size === 0} onClick={(e) => e.preventDefault()}>Exportar seleção</button>
            <button className="px-2 py-1.5 rounded-md border border-border disabled:opacity-50" disabled={selected.size === 0} onClick={(e) => e.preventDefault()}>Ação em massa (mock)</button>
          </div>
        </div>
        <div className="overflow-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 border-b bg-card/95 text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-card/70">
              <tr>
                <th scope="col" className="w-10 px-3 py-2.5">
                  <Tooltip content="Selecionar todos nesta página">
                    <input aria-label="Selecionar todos nesta página" type="checkbox" checked={allChecked} onChange={toggleAllOnPage} className="h-4 w-4 align-middle" />
                  </Tooltip>
                </th>
                <th scope="col" className="text-left font-medium px-3 py-2.5">
                  <Tooltip content="Identificador único da vistoria"><span>Vistoria</span></Tooltip>
                </th>
                <th scope="col" className="text-left font-medium px-3 py-2.5">
                  <Tooltip content="Unidade e endereço"><span>Imóvel</span></Tooltip>
                </th>
                <th scope="col" className="text-left font-medium px-3 py-2.5">
                  <Tooltip content="Responsável"><span>Corretor</span></Tooltip>
                </th>
                <th scope="col" className="text-left font-medium px-3 py-2.5">
                  <Tooltip content="Data/hora"><span>Data</span></Tooltip>
                </th>
                <th scope="col" className="text-left font-medium px-3 py-2.5">
                  <Tooltip content="Situação atual"><span>Status</span></Tooltip>
                </th>
                <th scope="col" className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((v) => (
                <tr key={v.id} className="border-t border-border odd:bg-background even:bg-muted/5 hover:bg-muted/20">
                  <td className="px-3 py-2 align-middle">
                    <input aria-label={`Selecionar vistoria ${v.id}`} type="checkbox" checked={selected.has(v.id)} onChange={() => toggleOne(v.id)} className="h-4 w-4" />
                  </td>
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
                  <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
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
