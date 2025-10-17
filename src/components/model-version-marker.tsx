"use client";

import { DeploymentEvent } from "@/lib/types";

type ModelVersionMarkerProps = {
  events: DeploymentEvent[];
};

export function ModelVersionMarker({ events }: ModelVersionMarkerProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Model Changelog
      </h3>
      <ul className="mt-3 space-y-2">
        {events.map((event) => (
          <li key={event.id} className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {event.type === "deploy" ? "Deploy" : "Retrain"}
            </p>
            <p className="text-sm font-semibold text-slate-100">
              {event.modelVersion}
            </p>
            <p className="text-xs text-slate-400">{event.deployedAt}</p>
            <p className="mt-1 text-xs text-slate-300">{event.notes}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
