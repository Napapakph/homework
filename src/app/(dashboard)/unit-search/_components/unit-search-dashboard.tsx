"use client";

import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UnitTimeline } from "@/components/unit-timeline";
import { InspectionDrawer } from "@/components/inspection-drawer";
import { InspectionRecord, UnitTimelinePayload } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

type UnitResponse = {
  data: UnitTimelinePayload;
};

type InspectionDetailResponse = {
  data: InspectionRecord;
};

export function UnitSearchDashboard() {
  const [inputSerial, setInputSerial] = useState("AC25W42-L1-00123");
  const [activeSerial, setActiveSerial] = useState("AC25W42-L1-00123");
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const unitQuery = useQuery<UnitResponse>({
    queryKey: ["unit", activeSerial],
    enabled: Boolean(activeSerial),
    queryFn: async () => {
      const response = await fetch(`/api/units/${activeSerial}`);
      if (!response.ok) {
        throw new Error("Unit not found");
      }
      return response.json();
    },
  });

  const inspectionDetailQuery = useQuery<InspectionDetailResponse>({
    queryKey: ["inspection-detail", drawerId],
    enabled: Boolean(drawerId),
    queryFn: async () => {
      const response = await fetch(`/api/inspections/${drawerId}`);
      if (!response.ok) {
        throw new Error("Failed to load inspection detail");
      }
      return response.json();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inputSerial.trim().length === 0) {
      return;
    }
    setActiveSerial(inputSerial.trim());
  }

  const unit = unitQuery.data?.data;

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6 md:flex-row md:items-end"
      >
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Serial Number or QR
          </label>
          <input
            value={inputSerial}
            onChange={(event) => setInputSerial(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            placeholder="Scan or type Serial..."
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-cyan-500 bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 transition md:w-32"
        >
          Search
        </button>
      </form>

      {unitQuery.isError ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          Unit not found in the mock dataset. Try AC25W42-L1-00123.
        </div>
      ) : null}

      {unit ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Serial
              </p>
              <p className="mt-2 font-mono text-lg text-slate-100">
                {unit.serial}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Current Status
              </p>
              <p
                className={`mt-2 inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold ${
                  unit.currentStatus === "OK"
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-rose-500/10 text-rose-300"
                }`}
              >
                {unit.currentStatus}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Last Event
              </p>
              <p className="mt-2 text-sm text-slate-100">
                {formatTimestamp(
                  unit.route.at(-1)?.capturedAt ?? new Date().toISOString(),
                )}
              </p>
            </div>
          </div>

          <UnitTimeline route={unit.route} />

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Stations
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {unit.route.map((step) => (
                <button
                  key={step.inspectionId}
                  onClick={() => setDrawerId(step.inspectionId)}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-left text-sm text-slate-300 hover:border-cyan-500/40"
                >
                  <p className="font-semibold text-slate-100">
                    {step.station}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatTimestamp(step.capturedAt)}
                  </p>
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      step.result === "OK"
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {step.result}
                  </p>
                  {step.ngCode ? (
                    <p className="text-xs text-rose-300">{step.ngCode}</p>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
          Enter a serial number to load unit history.
        </div>
      )}

      <InspectionDrawer
        open={Boolean(drawerId)}
        inspection={inspectionDetailQuery.data?.data}
        onClose={() => setDrawerId(null)}
      />
    </div>
  );
}
