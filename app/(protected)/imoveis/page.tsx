"use client";
import { useMemo, useState } from "react";
import { StatusBadge } from "../../../components/ui/StatusBadge";

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
  const [toDelete, setToDelete] = useState<Imovel | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
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
    setToast({ message: "Imóvel salvo com sucesso", tone: "success" });
    setTimeout(() => setToast(null), 2000);
  }
  function askRemove(im: Imovel) {
    setToDelete(im);
  }
  function confirmRemove() {
    if (!toDelete) return;
    const id = toDelete.id;
    setItems((prev) => prev.filter((p) => p.id !== id));
    setToDelete(null);
    setToast({ message: "Imóvel excluído", tone: "success" });
    setTimeout(() => setToast(null), 2000);
  }
  function cancelRemove() {
    setToDelete(null);
  }

  function statusBadge(s: ImovelStatus) {
    const tone: Record<ImovelStatus, "emerald" | "zinc" | "blue" | "amber"> = {
      ativo: "emerald",
      inativo: "zinc",
      alugado: "blue",
      manutencao: "amber",
    };
    const icon: Record<ImovelStatus, JSX.Element> = {
      ativo: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      ),
      inativo: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59Z" />
        </svg>
      ),
      alugado: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 6a6 6 0 1 1-4.24 10.24l-2.12 2.12-1.41-1.41 2.12-2.12A6 6 0 0 1 12 6Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
        </svg>
      ),
      manutencao: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M22.7 19.3 14.4 11a6 6 0 1 0-3.4 3.4l8.3 8.3 3.4-3.4ZM4 10a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
        </svg>
      ),
    };
    return (
      <StatusBadge tone={tone[s]} leftIcon={icon[s]}>
        {s === "manutencao" ? "manutenção" : s}
      </StatusBadge>
    );
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
              <th scope="col" className="text-left font-medium px-3 py-2.5">Imóvel</th>
              <th scope="col" className="text-left font-medium px-3 py-2.5">Tipo</th>
              <th scope="col" className="text-left font-medium px-3 py-2.5">Status</th>
              <th scope="col" className="text-left font-medium px-3 py-2.5">Quartos</th>
              <th scope="col" className="text-left font-medium px-3 py-2.5">Área (m²)</th>
              <th scope="col" className="text-left font-medium px-3 py-2.5">Valor (R$)</th>
              <th scope="col" className="px-3 py-2.5"></th>
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
                <td className="px-3 py-2">{statusBadge(im.status)}</td>
                <td className="px-3 py-2">{im.quartos}</td>
                <td className="px-3 py-2">{im.area_m2}</td>
                <td className="px-3 py-2">{im.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button aria-label={`Editar imóvel ${im.titulo}`} onClick={() => openEdit(im)} className="px-2 py-1.5 rounded-md border border-border hover:bg-muted/30">Editar</button>
                    <button aria-label={`Excluir imóvel ${im.titulo}`} onClick={() => askRemove(im)} className="px-2 py-1.5 rounded-md border border-rose-500/40 text-rose-400 hover:bg-rose-500/10">Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground" aria-live="polite">Nenhum resultado para os filtros atuais.</td>
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="dialog-imoveis-title">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-[0_0_12px_#0006]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 id="dialog-imoveis-title" className="text-lg font-medium">{editing.id ? "Editar imóvel" : "Novo imóvel"}</h3>
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

      {toDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={cancelRemove} role="dialog" aria-modal="true" aria-labelledby="dialog-imoveis-remove-title">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <h3 id="dialog-imoveis-remove-title" className="text-lg font-medium mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-muted-foreground mb-4">Tem certeza que deseja excluir "{toDelete.titulo}"?</p>
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
