import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export default function SectionCard({ title, subtitle, actions, children }: Props) {
  return (
    <section className="rounded-xl border border-border p-4 bg-card/60">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-medium leading-tight">{title}</h3>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
