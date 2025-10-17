"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiltersBar, FilterState } from "@/components/filters-bar";
import { TrendPassRate } from "@/components/charts/trend-pass-rate";
import { ConfusionMatrix } from "@/components/charts/confusion-matrix";
import { ModelVersionMarker } from "@/components/model-version-marker";
import { DeploymentEvent, ModelMetricWindow } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

type ModelMetricsResponse = {
  data: {
    metrics: ModelMetricWindow[];
    deployments: DeploymentEvent[];
  };
};

function buildQuery(filters: FilterState) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  return params.toString();
}

export function ModelMetricsDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    station: "ScrewCheck",
  });

  const metricsQuery = useQuery<ModelMetricsResponse>({
    queryKey: ["model-metrics", filters],
    queryFn: async () => {
      const response = await fetch(`/api/model-metrics?${buildQuery(filters)}`);
      if (!response.ok) {
        throw new Error("Failed to load model metrics");
      }
      return response.json();
    },
  });

  const rawMetrics = metricsQuery.data?.data.metrics;
  const rawDeployments = metricsQuery.data?.data.deployments;

  const metrics = useMemo(
    () => rawMetrics ?? [],
    [rawMetrics],
  );

  const deployments = useMemo(
    () => rawDeployments ?? [],
    [rawDeployments],
  );
  const latest = metrics.at(-1);

  const aggregate = useMemo(() => {
    if (metrics.length === 0) {
      return { precision: 0, recall: 0, accuracy: 0, auc: 0 };
    }
    const total = metrics.length;
    const sum = metrics.reduce(
      (acc, metric) => {
        acc.precision += metric.precision;
        acc.recall += metric.recall;
        acc.accuracy += metric.accuracy;
        acc.auc += metric.auc;
        return acc;
      },
      { precision: 0, recall: 0, accuracy: 0, auc: 0 },
    );
    return {
      precision: sum.precision / total,
      recall: sum.recall / total,
      accuracy: sum.accuracy / total,
      auc: sum.auc / total,
    };
  }, [metrics]);

  const trendData = metrics.map((metric) => {
    const relatedEvent = deployments.find(
      (event) =>
        event.modelVersion === metric.modelVersion &&
        event.deployedAt <= metric.windowStart,
    );
    return {
      bucketStart: metric.windowStart,
      passRate: metric.accuracy,
      modelVersion: metric.modelVersion,
      marker: relatedEvent?.type,
    };
  });

  return (
    <div className="space-y-8">
      <FiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        stations={["ScrewCheck", "LabelOCR", "DrawingConform"]}
        models={["HVAC-X100", "HVAC-Z200", "HVAC-Generic"]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Precision" value={formatPercent(aggregate.precision)} />
        <MetricCard label="Recall" value={formatPercent(aggregate.recall)} />
        <MetricCard label="Accuracy" value={formatPercent(aggregate.accuracy)} />
        <MetricCard label="AUC" value={formatPercent(aggregate.auc)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TrendPassRate data={trendData} />
        <ModelVersionMarker events={deployments} />
      </div>

      {latest ? (
        <ConfusionMatrix
          tp={latest.tp}
          tn={latest.tn}
          fp={latest.fp}
          fn={latest.fn}
        />
      ) : null}

      <div className="rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-300">
          Window Metrics
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2 text-left">Window Start</th>
                <th className="px-4 py-2 text-left">Window End</th>
                <th className="px-4 py-2 text-left">Model Version</th>
                <th className="px-4 py-2 text-left">Precision</th>
                <th className="px-4 py-2 text-left">Recall</th>
                <th className="px-4 py-2 text-left">Accuracy</th>
                <th className="px-4 py-2 text-left">AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {metrics.map((metric) => (
                <tr key={`${metric.modelVersion}-${metric.windowStart}`}>
                  <td className="px-4 py-2 text-xs">{metric.windowStart}</td>
                  <td className="px-4 py-2 text-xs">{metric.windowEnd}</td>
                  <td className="px-4 py-2 text-xs font-mono">
                    {metric.modelVersion}
                  </td>
                  <td className="px-4 py-2">{formatPercent(metric.precision)}</td>
                  <td className="px-4 py-2">{formatPercent(metric.recall)}</td>
                  <td className="px-4 py-2">{formatPercent(metric.accuracy)}</td>
                  <td className="px-4 py-2">{formatPercent(metric.auc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}
