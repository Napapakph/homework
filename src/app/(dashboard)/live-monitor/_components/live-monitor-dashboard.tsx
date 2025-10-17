"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LiveThumbnail,
  NgTickerEvent,
  StationStatus,
} from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

type LiveMonitorResponse = {
  data: {
    statuses: StationStatus[];
    thumbnails: LiveThumbnail[];
    ticker: NgTickerEvent[];
  };
};

export function LiveMonitorDashboard() {
  const [lastAcknowledged, setLastAcknowledged] = useState<string | null>(null);

  const liveQuery = useQuery<LiveMonitorResponse>({
    queryKey: ["live-monitor"],
    refetchInterval: 10_000,
    queryFn: async () => {
      const response = await fetch("/api/live-monitor");
      if (!response.ok) {
        throw new Error("Failed to load live status");
      }
      return response.json();
    },
  });

  const data = liveQuery.data?.data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">
          Line Health Status
        </h2>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          Auto refresh every 10s
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data?.statuses.map((status) => (
          <div
            key={`${status.line}-${status.station}`}
            className={`rounded-xl border p-4 ${
              status.status === "online"
                ? "border-emerald-500/40 bg-emerald-500/10"
                : status.status === "degraded"
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-rose-500/40 bg-rose-500/10"
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-slate-200">
              {status.line} • {status.station}
            </p>
            <p className="mt-2 text-sm text-slate-100">
              Camera {status.camera}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              Last heartbeat: {formatTimestamp(status.lastHeartbeat)}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-100">
              Status: {status.status.toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Latest Captures
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {data?.thumbnails.map((thumb) => (
              <div
                key={`${thumb.station}-${thumb.capturedAt}`}
                className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb.imageUri}
                  alt={`${thumb.station} thumbnail`}
                  className="h-40 w-full object-cover"
                />
                <div className="px-3 py-2 text-xs text-slate-300">
                  <p className="font-semibold text-slate-100">{thumb.station}</p>
                  <p>{formatTimestamp(thumb.capturedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            NG Ticker
          </h3>
          <div className="mt-4 space-y-3">
            {data?.ticker.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-rose-300">
                    {event.ngCode} ({event.station})
                  </p>
                  <p className="text-xs text-slate-400">
                    {event.serial} • {formatTimestamp(event.capturedAt)}
                  </p>
                </div>
                <button
                  className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-900"
                  onClick={() => setLastAcknowledged(event.id)}
                >
                  Ack
                </button>
              </div>
            ))}
          </div>
          {lastAcknowledged ? (
            <p className="mt-3 text-xs text-slate-400">
              Last acknowledged event: {lastAcknowledged}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
