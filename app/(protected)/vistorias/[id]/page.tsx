type Props = { params: { id: string } };

"use client";
import { useMemo, useState } from "react";

type VisStatus = "agendada" | "em_andamento" | "concluida" | "contestada";

// Anchor para evitar divergência de hidratação
const ANCHOR_TS = new Date("2025-06-01T12:00:00Z").getTime();

function getMockDetail(id: string) {
  const base = {
    id,
    imovel: `Apartamento ${Number(id) - 999}`,
    endereco: `Rua Exemplo ${Number(id) - 990}, Centro - Cidade/UF`,
    corretor: ["Ana", "Bruno", "Carla", "Diego"][Number(id) % 4],
    status: ([("agendada"), ("em_andamento"), ("concluida"), ("contestada")] as VisStatus[])[Number(id) % 4],
    criado_em: new Date(ANCHOR_TS - 5 * 86400000).toISOString(),
    atualizado_em: new Date(ANCHOR_TS - 1 * 86400000).toISOString(),
    data_agendada: new Date(ANCHOR_TS + 2 * 86400000).toISOString(),
  };

  const timeline = [
    { ts: new Date(ANCHOR_TS - 5 * 86400000).toISOString(), label: "Criada" },
    { ts: new Date(ANCHOR_TS - 3 * 86400000).toISOString(), label: "Agendada" },
    { ts: new Date(ANCHOR_TS - 1 * 86400000).toISOString(), label: "Check-list enviado" },
  ];

  const itens = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    titulo: ["Sala", "Cozinha", "Quarto", "Banheiro"][i % 4] + ` ${i + 1}`,
    status: ["ok", "pendente", "avaria"][i % 3],
    nota: i % 3 === 2 ? "Avaria na pintura próxima à janela." : "",
  }));

  const fotos = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    url: `https://picsum.photos/seed/vistoria-${id}-${i}/600/400`,
    legenda: `Foto ${i + 1}`,
  }));

  return { base, timeline, itens, fotos };
}

export default function VistoriaDetailPage({ params }: Props) {
  const { id } = params;
  const data = useMemo(() => getMockDetail(id), [id]);
  const [tab, setTab] = useState<"resumo" | "itens" | "fotos" | "pdf">("resumo");

  const StatusBadge = ({ s }: { s: VisStatus }) => {
    const map: Record<VisStatus, string> = {
      agendada: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      em_andamento: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      concluida: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      contestada: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    };
    return <span className={`px-2 py-0.5 text-xs rounded border ${map[s]}`}>{s.replace("_", " ")}</span>;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Vistoria #{data.base.id}</h1>
          <p className="text-sm text-muted-foreground">
            {data.base.imovel} — {data.base.endereco}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-md border border-border hover:bg-muted/30">Baixar PDF</button>
          <button className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90">Contestar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 rounded-lg border border-border p-4">
          <div className="flex gap-2 border-b border-border mb-4">
            {(["resumo", "itens", "fotos", "pdf"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-2 text-sm border-b-2 -mb-px ${
                  tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {tab === "resumo" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge s={data.base.status} />
                <span className="text-sm text-muted-foreground">
                  Corretor: <b>{data.base.corretor}</b>
                </span>
                <span className="text-sm text-muted-foreground">
                  Agendada para: {new Date(data.base.data_agendada).toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Linha do tempo</h3>
                <ol className="relative border-l border-border ml-3">
                  {data.timeline.map((ev, i) => (
                    <li key={i} className="ml-4 py-2">
                      <div className="absolute w-2 h-2 rounded-full bg-primary -left-1 mt-2" />
                      <time className="text-xs text-muted-foreground">
                        {new Date(ev.ts).toLocaleString()}
                      </time>
                      <div className="text-sm">{ev.label}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {tab === "itens" && (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-3 py-2.5">Item</th>
                    <th className="text-left font-medium px-3 py-2.5">Status</th>
                    <th className="text-left font-medium px-3 py-2.5">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {data.itens.map((it) => (
                    <tr key={it.id} className="border-t border-border">
                      <td className="px-3 py-2">{it.titulo}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 text-xs rounded border border-border">
                          {it.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{it.nota || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "fotos" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.fotos.map((f) => (
                <figure key={f.id} className="rounded-lg overflow-hidden border border-border">
                  <img src={f.url} alt={f.legenda} className="w-full h-40 object-cover" />
                  <figcaption className="text-xs text-muted-foreground p-2">{f.legenda}</figcaption>
                </figure>
              ))}
            </div>
          )}

          {tab === "pdf" && (
            <div className="h-[60vh] grid place-items-center border border-dashed border-border rounded-md">
              <div className="text-center">
                <div className="text-lg font-medium mb-1">Visualizador de PDF (placeholder)</div>
                <p className="text-sm text-muted-foreground">
                  Quando integrarmos o backend, exibiremos o PDF aqui.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-border p-4 space-y-3">
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="mt-1"><StatusBadge s={data.base.status} /></div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Criado em</div>
            <div className="text-sm">{new Date(data.base.criado_em).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Atualizado em</div>
            <div className="text-sm">{new Date(data.base.atualizado_em).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Agendada</div>
            <div className="text-sm">{new Date(data.base.data_agendada).toLocaleString()}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
