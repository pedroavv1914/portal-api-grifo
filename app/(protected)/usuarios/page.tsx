"use client";
import { useMemo, useState } from "react";

type UserRole = "admin" | "gestor" | "corretor" | "vistoriador";
type UserStatus = "ativo" | "inativo";
type Usuario = {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  criado_em: string; // ISO
};

const ANCHOR_TS = new Date("2025-06-01T12:00:00Z").getTime();
const MOCK_NOMES = [
  "Ana Souza","Bruno Lima","Carla Mendes","Diego Alves","Eduarda Rocha","Felipe Martins","Gabriela Nunes","Henrique Silva","Isabela Costa","João Pereira","Karina Duarte","Lucas Gomes","Mariana Freitas","Nicolas Azevedo","Olívia Barros","Paulo Teixeira","Queila Moraes","Rafael Pinto","Sabrina Faria","Tiago Campos","Úrsula Pires","Vitor Ramos","Wesley Prado","Xênia Teles","Yasmin Brito","Zeca Moreira","Bia Andrade","Caio Torres"
];
const MOCK_USERS: Usuario[] = Array.from({ length: 28 }).map((_, i) => {
  const roles: UserRole[] = ["admin", "gestor", "corretor", "vistoriador"];
  const statuses: UserStatus[] = ["ativo", "inativo"];
  const nome = MOCK_NOMES[i % MOCK_NOMES.length];
  const email = nome.toLowerCase().replace(/[^a-z]/g, "") + (i % 3) + "@empresa.com";
  return {
    id: (3000 + i).toString(),
    nome,
    email,
    role: roles[i % 4],
    status: statuses[i % 2],
    criado_em: new Date(ANCHOR_TS - i * 86400000).toISOString(),
  } satisfies Usuario;
});

export default function UsuariosPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"todas" | UserRole>("todas");
  const [status, setStatus] = useState<"todos" | UserStatus>("todos");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Usuario[]>(MOCK_USERS);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return items.filter((u) => {
      const q = `${u.nome} ${u.email}`.toLowerCase();
      const matchesQ = q.includes(query.toLowerCase());
      const matchesRole = role === "todas" ? true : u.role === role;
      const matchesStatus = status === "todos" ? true : u.status === status;
      return matchesQ && matchesRole && matchesStatus;
    });
  }, [items, query, role, status]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function openCreate() {
    setEditing({
      id: "",
      nome: "",
      email: "",
      role: "corretor",
      status: "ativo",
      criado_em: new Date(ANCHOR_TS).toISOString(),
    });
    setIsOpen(true);
  }
  function openEdit(u: Usuario) {
    setEditing({ ...u });
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
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <p className="text-sm text-muted-foreground">Gestão de usuários e papéis (mock)</p>
        </div>
        <button onClick={openCreate} className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90">
          Novo usuário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 flex gap-2">
          <input
            placeholder="Buscar por nome ou e-mail"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="flex-1 h-9 px-3 rounded-md border border-input bg-background"
          />
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value as any); setPage(1); }}
            className="h-9 px-2 rounded-md border border-input bg-background"
          >
            <option value="todas">Todos papéis</option>
            <option value="admin">Admin</option>
            <option value="gestor">Gestor</option>
            <option value="corretor">Corretor</option>
            <option value="vistoriador">Vistoriador</option>
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
            className="h-9 px-2 rounded-md border border-input bg-background"
          >
            <option value="todos">Todos status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
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
              <th className="text-left font-medium px-3 py-2.5">Nome</th>
              <th className="text-left font-medium px-3 py-2.5">E-mail</th>
              <th className="text-left font-medium px-3 py-2.5">Papel</th>
              <th className="text-left font-medium px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-3 py-2">{u.nome}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2 capitalize">{u.role}</td>
                <td className="px-3 py-2 capitalize">{u.status}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(u)} className="px-2 py-1.5 rounded-md border border-border hover:bg-muted/30">Editar</button>
                    <button onClick={() => removeItem(u.id)} className="px-2 py-1.5 rounded-md border border-rose-500/40 text-rose-400 hover:bg-rose-500/10">Excluir</button>
                  </div>
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

      {isOpen && editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={closeModal}>
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-[0_0_12px_#0006]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">{editing.id ? "Editar usuário" : "Novo usuário"}</h3>
              <button className="text-sm text-muted-foreground hover:opacity-80" onClick={closeModal}>Fechar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground">Nome</label>
                <input value={editing.nome} onChange={(e) => setEditing((prev) => prev ? { ...prev, nome: e.target.value } : prev)} className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground">E-mail</label>
                <input value={editing.email} onChange={(e) => setEditing((prev) => prev ? { ...prev, email: e.target.value } : prev)} className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Papel</label>
                <select value={editing.role} onChange={(e) => setEditing((prev) => prev ? { ...prev, role: e.target.value as UserRole } : prev)} className="mt-1 h-9 w-full px-2 rounded-md border border-input bg-background">
                  <option value="admin">Admin</option>
                  <option value="gestor">Gestor</option>
                  <option value="corretor">Corretor</option>
                  <option value="vistoriador">Vistoriador</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select value={editing.status} onChange={(e) => setEditing((prev) => prev ? { ...prev, status: e.target.value as UserStatus } : prev)} className="mt-1 h-9 w-full px-2 rounded-md border border-input bg-background">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
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
