"use client";

import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  title: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
};

export function KpiCard({ title, value, delta, deltaLabel, icon }: KpiCardProps) {
  const positive = delta !== undefined && delta >= 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">
          {title}
        </div>
        <div className="text-cyan-400">{icon}</div>
      </div>
      <div className="mt-3 text-3xl font-semibold text-slate-100">{value}</div>
      {delta !== undefined ? (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold",
              positive
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-rose-500/10 text-rose-300",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="text-slate-500">{deltaLabel ?? "vs prev."}</span>
        </div>
      ) : null}
    </div>
  );
}
