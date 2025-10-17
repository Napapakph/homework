"use client";

import { X } from "lucide-react";
import { InspectionRecord } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

type InspectionDrawerProps = {
  open: boolean;
  inspection?: InspectionRecord | null;
  onClose: () => void;
};

export function InspectionDrawer({
  open,
  inspection,
  onClose,
}: InspectionDrawerProps) {
  if (!open || !inspection) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/60">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-800 bg-slate-950 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">
              Inspection Detail
            </h2>
            <p className="text-sm text-slate-400">
              {inspection.station} - {inspection.result} -{" "}
              {formatTimestamp(inspection.capturedAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-slate-700 p-2 text-slate-400 hover:bg-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Metadata
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Serial</dt>
                <dd className="font-mono text-slate-100">{inspection.serial}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Work Order</dt>
                <dd className="font-mono text-slate-100">
                  {inspection.workOrder}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Model</dt>
                <dd className="text-slate-100">{inspection.model}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Model Version</dt>
                <dd className="text-slate-100">{inspection.modelVersion}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Confidence</dt>
                <dd className="text-slate-100">
                  {(inspection.confidence * 100).toFixed(1)}%
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Operator</dt>
                <dd className="text-slate-100">{inspection.operator ?? "-"}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Reference Image
            </h3>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inspection.imageUri}
                alt={`${inspection.station} capture`}
                className="w-full object-cover"
              />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Features
            </h3>
            <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-slate-800 bg-slate-900 p-4 text-xs text-emerald-200">
              {JSON.stringify(inspection.features, null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
