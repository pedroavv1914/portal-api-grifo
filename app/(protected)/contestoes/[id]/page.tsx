"use client";
import Link from "next/link";
import { useMemo } from "react";

type ContStatus = "aberta" | "em_analise" | "aceita" | "rejeitada";

type TimelineItem = {
  label: string;
  at: string; // ISO
};

type Detail = {
  id: string;
  protocolo: string;
  vistoriaId: string;
  imovel: string;
  autor: string;
  status: ContStatus;
  criada_em: string;
  timeline: TimelineItem[];
};

const ANCHOR_TS = new Date("2025-06-01T12:00:00Z").getTime();

function getMockDetail(id: string): Detail {
  const idx = Number(id) % 12;
  const statusPool: ContStatus[] = ["aberta", "em_analise", "aceita", "rejeitada"];
  const status = statusPool[idx % statusPool.length];
  const base = ANCHOR_TS - idx * 36_000_00; // cada um desloca ~10h
  const created = new Date(base).toISOString();
  const timeline: TimelineItem[] = [
    { label: "Contestação aberta", at: created },
    { label: "Análise iniciada", at: new Date(base + 6 * 3_600_000).toISOString() },
    { label: status === "aceita" ? "Contestação aceita" : status === "rejeitada" ? "Contestação rejeitada" : "Aguardando decisão", at: new Date(base + 18 * 3_600_000).toISOString() },
  ];
  return {
    id,
    protocolo: `CT-${(10000 + idx).toString()}`,
    vistoriaId: (1000 + idx).toString(),
    imovel: `Imóvel ${idx + 1} - Av. Modelo ${idx + 50}`,
    autor: ["Inquilino", "Proprietário", "Corretor"][idx % 3],
    status,
    criada_em: created,
    timeline,
  };
}

export default function ContestacaoDetailPage({ params }: { params: { id: string } }) {
  const data = useMemo(() => getMockDetail(params.id), [params.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Contestação {data.protocolo}</h1>
          <p className="text-sm text-muted-foreground">Vistoria #{data.vistoriaId} • {data.imovel}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/contestoes" className="px-3 py-2 rounded-md border border-border hover:bg-muted/30 text-sm">Voltar</Link>
          <button className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm">Baixar PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-medium mb-2">Resumo</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Autor</div>
              <div>{data.autor}</div>
              <div className="text-muted-foreground">Status</div>
              <div className="capitalize">{data.status.replace("_", " ")}</div>
              <div className="text-muted-foreground">Criada em</div>
              <div>{new Date(data.criada_em).toLocaleString("pt-BR")}</div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Timeline</h3>
            <ol className="relative border-s border-border ps-4">
              {data.timeline.map((t, i) => (
                <li key={i} className="mb-5 ms-2">
                  <span className="absolute -start-1.5 mt-1 h-3 w-3 rounded-full bg-primary" />
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{new Date(t.at).toLocaleString("pt-BR")}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-medium mb-2">Anexos (UI placeholder)</h3>
            <div className="text-sm text-muted-foreground mb-3">Envie evidências para complementar a contestação.</div>
            <div className="rounded-md border border-dashed border-border p-6 text-center">
              <div className="text-sm">Arraste e solte arquivos aqui</div>
              <div className="text-xs text-muted-foreground">ou</div>
              <button className="mt-2 px-3 py-1.5 rounded-md border border-border text-sm">Selecionar arquivos</button>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span className="text-muted-foreground">foto-exemplo-1.jpg</span>
                <button className="text-rose-400 hover:underline">Remover</button>
              </li>
              <li className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span className="text-muted-foreground">laudo-anexo.pdf</span>
                <button className="text-rose-400 hover:underline">Remover</button>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="font-medium mb-2">Ações</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-2 rounded-md border border-border text-sm">Aprovar</button>
              <button className="px-3 py-2 rounded-md border border-border text-sm">Rejeitar</button>
              <button className="px-3 py-2 rounded-md border border-border text-sm">Solicitar mais infos</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
