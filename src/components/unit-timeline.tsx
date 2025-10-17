"use client";

import { UnitTimelineEntry } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

type UnitTimelineProps = {
  route: UnitTimelineEntry[];
};

export function UnitTimeline({ route }: UnitTimelineProps) {
  return (
    <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Station Progress
      </h3>
      <ol className="relative border-l border-slate-700 pl-6">
        {route.map((step) => {
          const ok = step.result === "OK";
          return (
            <li key={step.inspectionId} className="mb-6 ml-2">
              <span
                className={
                  "absolute -left-3 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-semibold " +
                  (ok
                    ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                    : "border-rose-500/40 bg-rose-500/10 text-rose-300")
                }
              >
                {step.station[0]}
              </span>
              <h4 className="text-sm font-semibold text-slate-100">
                {step.station}
              </h4>
              <p className="text-xs text-slate-400">
                {formatTimestamp(step.capturedAt)}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Result:{" "}
                <span
                  className={
                    ok ? "text-emerald-300 font-semibold" : "text-rose-300 font-semibold"
                  }
                >
                  {step.result}
                </span>
              </p>
              {step.ngCode ? (
                <p className="text-xs text-rose-300">NG Code: {step.ngCode}</p>
              ) : null}
              {step.operator ? (
                <p className="text-xs text-slate-400">Operator: {step.operator}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
