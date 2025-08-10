"use client";
import { useMemo, useState } from "react";

type EmpresaStatus = "ativa" | "inativa";
type Empresa = {
  id: string;
  nome: string;
  cnpj: string;
  contato: string;
  email: string;
  status: EmpresaStatus;
  criada_em: string; // ISO
};

const ANCHOR_TS = new Date("2025-06-01T12:00:00Z").getTime();
const MOCK_EMPRESAS: Empresa[] = Array.from({ length: 22 }).map((_, i) => {
  const nomes = [
    "Grifo Imóveis",
    "Alpha Realty",
    "Beta Patrimônio",
    "Gamma Gestão",
    "Delta Properties",
    "Epsilon Houses",
  ];
  const nome = `${nomes[i % nomes.length]} ${i + 1}`;
  const cnpj = `12.345.${(600 + i).toString().padStart(3, "0")}/0001-${(10 + (i % 90)).toString().padStart(2, "0")}`;
  const contato = ["Ana", "Bruno", "Carla", "Diego"][i % 4] + " Silva";
  const email = `contato${i}@${nome.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  const status: EmpresaStatus = i % 5 === 0 ? "inativa" : "ativa";
  return {
    id: (4000 + i).toString(),
    nome,
    cnpj,
    contato,
    email,
    status,
    criada_em: new Date(ANCHOR_TS - i * 86400000).toISOString(),
  } satisfies Empresa;
});

export default function EmpresasPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"todos" | EmpresaStatus>("todos");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Empresa[]>(MOCK_EMPRESAS);
  const [editing, setEditing] = useState<Empresa | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return items.filter((e) => {
      const q = `${e.nome} ${e.cnpj} ${e.contato} ${e.email}`.toLowerCase();
      const matchesQ = q.includes(query.toLowerCase());
      const matchesStatus = status === "todos" ? true : e.status === status;
      return matchesQ && matchesStatus;
    });
  }, [items, query, status]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function openCreate() {
    setEditing({
      id: "",
      nome: "",
      cnpj: "",
      contato: "",
      email: "",
      status: "ativa",
      criada_em: new Date(ANCHOR_TS).toISOString(),
    });
    setIsOpen(true);
  }
  function openEdit(e: Empresa) {
    setEditing({ ...e });
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
    setEditing(null);
  }
  function saveItem() {
    if (!editing) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editing.email)) {
      alert("E-mail inválido");
      return;
    }
    if (editing.id) {
      setItems((prev) => prev.map((p) => (p.id === editing.id ? editing : p)));
    } else {
      const newId = (Math.max(0, ...items.map((x) => Number(x.id))) + 1).toString();
      setItems((prev) => [{ ...editing, id: newId }, ...prev]);
    }
    closeModal();
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Empresas</h1>
          <p className="text-sm text-muted-foreground">Gestão de tenants (mock)</p>
        </div>
        <button onClick={openCreate} className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90">
          Nova empresa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Buscar por nome, CNPJ, contato ou e-mail"
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
          <option value="ativa">Ativa</option>
          <option value="inativa">Inativa</option>
        </select>
        <div className="flex items-center justify-end text-sm text-muted-foreground">{total} resultados</div>
      </div>

      <div className="overflow-auto rounded-lg border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-3 py-2.5">Empresa</th>
              <th className="text-left font-medium px-3 py-2.5">CNPJ</th>
              <th className="text-left font-medium px-3 py-2.5">Contato</th>
              <th className="text-left font-medium px-3 py-2.5">E-mail</th>
              <th className="text-left font-medium px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="px-3 py-2">{e.nome}</td>
                <td className="px-3 py-2">{e.cnpj}</td>
                <td className="px-3 py-2">{e.contato}</td>
                <td className="px-3 py-2">{e.email}</td>
                <td className="px-3 py-2 capitalize">{e.status}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(e)} className="px-2 py-1.5 rounded-md border border-border hover:bg-muted/30">Editar</button>
                    <button onClick={() => removeItem(e.id)} className="px-2 py-1.5 rounded-md border border-rose-500/40 text-rose-400 hover:bg-rose-500/10">Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">Nenhum resultado para os filtros atuais.</td>
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

      {isOpen && editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={closeModal}>
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-[0_0_12px_#0006]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">{editing.id ? "Editar empresa" : "Nova empresa"}</h3>
              <button className="text-sm text-muted-foreground hover:opacity-80" onClick={closeModal}>Fechar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground">Nome</label>
                <input value={editing.nome} onChange={(e) => setEditing((prev) => prev ? { ...prev, nome: e.target.value } : prev)} className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">CNPJ</label>
                <input value={editing.cnpj} onChange={(e) => setEditing((prev) => prev ? { ...prev, cnpj: e.target.value } : prev)} className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Contato</label>
                <input value={editing.contato} onChange={(e) => setEditing((prev) => prev ? { ...prev, contato: e.target.value } : prev)} className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground">E-mail</label>
                <input value={editing.email} onChange={(e) => setEditing((prev) => prev ? { ...prev, email: e.target.value } : prev)} className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select value={editing.status} onChange={(e) => setEditing((prev) => prev ? { ...prev, status: e.target.value as EmpresaStatus } : prev)} className="mt-1 h-9 w-full px-2 rounded-md border border-input bg-background">
                  <option value="ativa">Ativa</option>
                  <option value="inativa">Inativa</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 rounded-md border border-border" onClick={closeModal}>Cancelar</button>
              <button className="px-3 py-2 rounded-md bg-primary text-primary-foreground" onClick={saveItem}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
