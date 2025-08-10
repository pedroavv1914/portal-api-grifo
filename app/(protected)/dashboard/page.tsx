"use client";
import { useMemo } from "react";

type KPI = { label: string; value: number; delta?: number; color?: string };

export default function DashboardPage() {
  // Dados mockados e determinísticos
  const kpis: KPI[] = useMemo(
    () => [
      { label: "Vistorias (30d)", value: 128, delta: 12, color: "#f59e0b" },
      { label: "Pendentes", value: 24, delta: -3, color: "#3b82f6" },
      { label: "Concluídas", value: 86, delta: 8, color: "#10b981" },
      { label: "Contestadas", value: 6, delta: 1, color: "#f43f5e" },
    ],
    []
  );

  const bars = useMemo(() => {
    // Série fixa (7 dias)
    return [18, 22, 12, 26, 30, 24, 20];
  }, []);

  const pie = useMemo(
    () => [
      { label: "Pendentes", value: 24, color: "#3b82f6" },
      { label: "Concluídas", value: 86, color: "#10b981" },
      { label: "Contestadas", value: 6, color: "#f43f5e" },
      { label: "Agendadas", value: 12, color: "#f59e0b" },
    ],
    []
  );
  const pieTotal = useMemo(() => pie.reduce((acc, s) => acc + s.value, 0), [pie]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">KPIs e gráficos (UI-only, mock)</p>
        </div>
        <a href="/vistorias" className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90">
          Ver vistorias
        </a>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border p-4">
            <div className="text-sm text-muted-foreground">{k.label}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-2xl font-semibold">{k.value}</div>
              {typeof k.delta === "number" && (
                <div
                  className={`text-xs px-1.5 py-0.5 rounded border ${
                    k.delta >= 0 ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-rose-500/30 text-rose-400 bg-rose-500/10"
                  }`}
                >
                  {k.delta >= 0 ? "+" : ""}
                  {k.delta}%
                </div>
              )}
            </div>
            <div className="mt-3 h-1.5 rounded bg-muted overflow-hidden">
              <div className="h-full" style={{ width: `${Math.min(100, k.value)}%`, backgroundColor: k.color }} />
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart placeholder */}
        <div className="rounded-xl border border-border p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Vistorias por dia (7d)</h3>
            <span className="text-xs text-muted-foreground">mock</span>
          </div>
          <div className="mt-4 h-48 flex items-end gap-2">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 bg-muted rounded-sm relative">
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-sm"
                  style={{ height: `${(h / 35) * 100}%`, backgroundColor: "#3b82f6" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            {Array.from({ length: bars.length }).map((_, i) => (
              <span key={i}>D{i + 1}</span>
            ))}
          </div>
        </div>

        {/* Pie chart placeholder */}
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Distribuição por status</h3>
            <span className="text-xs text-muted-foreground">mock</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 items-center">
            <svg viewBox="0 0 42 42" className="w-40 h-40 justify-self-center">
              {(() => {
                let acc = 0;
                return pie.map((seg, idx) => {
                  const frac = seg.value / pieTotal;
                  const dash = 2 * Math.PI * 16;
                  const strokeDasharray = `${dash * frac} ${dash * (1 - frac)}`;
                  const strokeDashoffset = -acc * dash;
                  acc += frac;
                  return (
                    <circle
                      key={idx}
                      r="16"
                      cx="21"
                      cy="21"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="8"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                    />
                  );
                });
              })()}
            </svg>
            <ul className="space-y-2">
              {pie.map((seg) => (
                <li key={seg.label} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: seg.color }} />
                  <span className="text-muted-foreground flex-1">{seg.label}</span>
                  <b>{seg.value}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
