"use client";
import { useMemo, useState } from "react";

type ImovelStatus = "ativo" | "inativo" | "alugado" | "manutencao";
type ImovelTipo = "apartamento" | "casa" | "comercial" | "terreno";
type Imovel = {
  id: string;
  titulo: string;
  endereco: string;
  tipo: ImovelTipo;
  status: ImovelStatus;
  quartos: number;
  area_m2: number;
  valor: number; // R$
  criado_em: string; // ISO
};

const ANCHOR_TS = new Date("2025-06-01T12:00:00Z").getTime();
const MOCK_IMOVEIS: Imovel[] = Array.from({ length: 32 }).map((_, i) => {
  const tipos: ImovelTipo[] = ["apartamento", "casa", "comercial", "terreno"];
  const statuses: ImovelStatus[] = ["ativo", "inativo", "alugado", "manutencao"];
  return {
    id: (2000 + i).toString(),
    titulo: `${tipos[i % 4]} ${i + 1}`,
    endereco: `Av. Modelo ${i + 100}, Bairro ${i % 7}, Cidade/UF`,
    tipo: tipos[i % 4],
    status: statuses[i % 4],
    quartos: (i % 5) + 1,
    area_m2: 45 + (i % 10) * 12,
    valor: 1200 + (i % 8) * 350,
    criado_em: new Date(ANCHOR_TS - i * 43200000).toISOString(),
  } satisfies Imovel;
});

export default function ImoveisPage() {
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState<"todos" | ImovelTipo>("todos");
  const [status, setStatus] = useState<"todos" | ImovelStatus>("todos");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Imovel[]>(MOCK_IMOVEIS);
  const [editing, setEditing] = useState<Imovel | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return items.filter((im) => {
      const q = `${im.titulo} ${im.endereco}`.toLowerCase();
      const matchesQ = q.includes(query.toLowerCase());
      const matchesTipo = tipo === "todos" ? true : im.tipo === tipo;
      const matchesStatus = status === "todos" ? true : im.status === status;
      return matchesQ && matchesTipo && matchesStatus;
    });
  }, [items, query, tipo, status]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function openCreate() {
    setEditing({
      id: "",
      titulo: "",
      endereco: "",
      tipo: "apartamento",
      status: "ativo",
      quartos: 2,
      area_m2: 60,
      valor: 1500,
      criado_em: new Date(ANCHOR_TS).toISOString(),
    });
    setIsOpen(true);
  }
  function openEdit(im: Imovel) {
    setEditing({ ...im });
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
    setEditing(null);
  }
  function saveItem() {
    if (!editing) return;
    if (editing.id) {
      // update
      setItems((prev) => prev.map((p) => (p.id === editing.id ? editing : p)));
    } else {
      // create
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
          <h1 className="text-2xl font-semibold">Imóveis</h1>
          <p className="text-sm text-muted-foreground">UI de lista e cadastro (mock)</p>
        </div>
        <button onClick={openCreate} className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90">
          Novo imóvel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 flex gap-2">
          <input
            placeholder="Buscar por título ou endereço"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="flex-1 h-9 px-3 rounded-md border border-input bg-background"
          />
          <select
            value={tipo}
            onChange={(e) => { setTipo(e.target.value as any); setPage(1); }}
            className="h-9 px-2 rounded-md border border-input bg-background"
          >
            <option value="todos">Todos tipos</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="comercial">Comercial</option>
            <option value="terreno">Terreno</option>
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
            className="h-9 px-2 rounded-md border border-input bg-background"
          >
            <option value="todos">Todos status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="alugado">Alugado</option>
            <option value="manutencao">Manutenção</option>
          </select>
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">{total} resultados</span>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-3 py-2.5">Imóvel</th>
              <th className="text-left font-medium px-3 py-2.5">Tipo</th>
              <th className="text-left font-medium px-3 py-2.5">Status</th>
              <th className="text-left font-medium px-3 py-2.5">Quartos</th>
              <th className="text-left font-medium px-3 py-2.5">Área (m²)</th>
              <th className="text-left font-medium px-3 py-2.5">Valor (R$)</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((im) => (
              <tr key={im.id} className="border-t border-border">
                <td className="px-3 py-2">
                  <div className="font-medium">{im.titulo}</div>
                  <div className="text-muted-foreground text-xs">{im.endereco}</div>
                </td>
                <td className="px-3 py-2 capitalize">{im.tipo}</td>
                <td className="px-3 py-2 capitalize">{im.status}</td>
                <td className="px-3 py-2">{im.quartos}</td>
                <td className="px-3 py-2">{im.area_m2}</td>
                <td className="px-3 py-2">{im.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(im)} className="px-2 py-1.5 rounded-md border border-border hover:bg-muted/30">Editar</button>
                    <button onClick={() => removeItem(im.id)} className="px-2 py-1.5 rounded-md border border-rose-500/40 text-rose-400 hover:bg-rose-500/10">Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">Nenhum resultado para os filtros atuais.</td>
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

      {/* Modal simples para criar/editar */}
      {isOpen && editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={closeModal}>
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-[0_0_12px_#0006]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">{editing.id ? "Editar imóvel" : "Novo imóvel"}</h3>
              <button className="text-sm text-muted-foreground hover:opacity-80" onClick={closeModal}>Fechar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">Título</label>
                <input value={editing.titulo} onChange={(e) => setEditing((prev) => prev ? { ...prev, titulo: e.target.value } : prev)} className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">Endereço</label>
                <input value={editing.endereco} onChange={(e) => setEditing((prev) => prev ? { ...prev, endereco: e.target.value } : prev)} className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Tipo</label>
                <select value={editing.tipo} onChange={(e) => setEditing((prev) => prev ? { ...prev, tipo: e.target.value as ImovelTipo } : prev)} className="mt-1 h-9 w-full px-2 rounded-md border border-input bg-background">
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="comercial">Comercial</option>
                  <option value="terreno">Terreno</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select value={editing.status} onChange={(e) => setEditing((prev) => prev ? { ...prev, status: e.target.value as ImovelStatus } : prev)} className="mt-1 h-9 w-full px-2 rounded-md border border-input bg-background">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="alugado">Alugado</option>
                  <option value="manutencao">Manutenção</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Quartos</label>
                <input type="number" min={0} value={editing.quartos} onChange={(e) => setEditing((prev) => prev ? { ...prev, quartos: Number(e.target.value) } : prev)} className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Área (m²)</label>
                <input type="number" min={0} value={editing.area_m2} onChange={(e) => setEditing((prev) => prev ? { ...prev, area_m2: Number(e.target.value) } : prev)} className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground">Valor (R$)</label>
                <input type="number" min={0} value={editing.valor} onChange={(e) => setEditing((prev) => prev ? { ...prev, valor: Number(e.target.value) } : prev)} className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background" />
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
