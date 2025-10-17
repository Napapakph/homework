"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterState, FiltersBar } from "@/components/filters-bar";
import { KpiCard } from "@/components/kpi-card";
import { DonutOkNg } from "@/components/charts/donut-ok-ng";
import { ParetoNg } from "@/components/charts/pareto-ng";
import { TrendPassRate } from "@/components/charts/trend-pass-rate";
import { NgTable } from "@/components/ng-table";
import { ExportButtons } from "@/components/export-buttons";
import { InspectionDrawer } from "@/components/inspection-drawer";
import { formatNumber, formatPercent } from "@/lib/utils";
import {
  InspectionRecord,
  ParetoPoint,
  TrendPoint,
  PaginatedResponse,
  InspectionListItem,
  Result,
} from "@/lib/types";

type SummaryResponse = {
  data: {
    passRate: number;
    ngRate: number;
    topNg: Array<{ code: string; count: number; ratio: number }>;
    avgCycleTime: number;
    inspectedToday: number;
    ok: number;
    ng: number;
  };
};

type TrendResponse = {
  data: TrendPoint[];
};

type ParetoResponse = {
  data: ParetoPoint[];
};

type InspectionsResponse = PaginatedResponse<InspectionListItem>;

type InspectionDetailResponse = {
  data: InspectionRecord;
};

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.length > 0) {
      search.set(key, value);
    }
  });
  return search.toString();
}

export function OverviewDashboard() {
  const [filters, setFilters] = useState<FilterState>({});
  const [resultFilter, setResultFilter] = useState<Result>("NG");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const summaryQuery = useQuery<SummaryResponse>({
    queryKey: ["summary", filters],
    queryFn: async () => {
      const query = buildQuery(filters);
      const response = await fetch(`/api/summary?${query}`);
      if (!response.ok) {
        throw new Error("Failed to load summary");
      }
      return response.json();
    },
  });

  const trendQuery = useQuery<TrendResponse>({
    queryKey: ["trend", filters],
    queryFn: async () => {
      const query = buildQuery(filters);
      const response = await fetch(`/api/trend?${query}`);
      if (!response.ok) {
        throw new Error("Failed to load trend");
      }
      return response.json();
    },
  });

  const paretoQuery = useQuery<ParetoResponse>({
    queryKey: ["pareto", filters],
    queryFn: async () => {
      const query = buildQuery(filters);
      const response = await fetch(`/api/ng-pareto?${query}`);
      if (!response.ok) {
        throw new Error("Failed to load pareto");
      }
      return response.json();
    },
  });

  const inspectionQuery = useQuery<InspectionsResponse>({
    queryKey: ["inspections", filters, resultFilter],
    queryFn: async () => {
      const query = buildQuery({ ...filters, result: resultFilter });
      const response = await fetch(`/api/inspections?${query}`);
      if (!response.ok) {
        throw new Error("Failed to load inspections");
      }
      return (await response.json()) as InspectionsResponse;
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

  const summary = summaryQuery.data?.data;
  const donutData = useMemo(
    () => [
      { label: "OK", value: summary?.ok ?? 0 },
      { label: "NG", value: summary?.ng ?? 0 },
    ],
    [summary],
  );

  const trend = trendQuery.data?.data ?? [];
  const pareto = paretoQuery.data?.data ?? [];
  const inspections = inspectionQuery.data?.data ?? [];

  const firstNg = summary?.topNg[0];

  return (
    <div className="space-y-8">
      <FiltersBar filters={filters} onFiltersChange={setFilters} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Pass Rate"
          value={formatPercent(summary?.passRate ?? 0)}
          delta={(summary?.passRate ?? 0) * 10 - 5}
          deltaLabel="vs yesterday"
        />
        <KpiCard
          title="NG Rate"
          value={formatPercent(summary?.ngRate ?? 0)}
          delta={-((summary?.ngRate ?? 0) * 10 - 3)}
          deltaLabel="trend change"
        />
        <KpiCard
          title="Top NG"
          value={firstNg ? `${firstNg.code}` : "None"}
          delta={firstNg ? firstNg.ratio * 100 : 0}
          deltaLabel="share of NG"
        />
        <KpiCard
          title="Units Inspected"
          value={formatNumber(summary?.inspectedToday ?? 0)}
          delta={summary ? (summary.ok - summary.ng) / Math.max(summary.ok, 1) : 0}
          deltaLabel="net OK vs NG"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <DonutOkNg
          data={donutData}
        onSelect={(label) => setResultFilter(label === "OK" ? "OK" : "NG")}
        />
        <TrendPassRate data={trend} />
      </div>

      <ParetoNg
        data={pareto.map((item) => ({
          ngCode: item.ngCode,
          count: item.count,
          ratio: item.ratio,
        }))}
      />

      <ExportButtons filters={filters} selectedIds={selectedRows} />

      <NgTable
        data={inspections}
        loading={inspectionQuery.isLoading}
        onRowClick={(id) => setDrawerId(id)}
        onSelectionChange={setSelectedRows}
        title={resultFilter === "OK" ? "Recent OK inspections" : "Recent NG inspections"}
      />

      <InspectionDrawer
        open={Boolean(drawerId)}
        inspection={inspectionDetailQuery.data?.data}
        onClose={() => setDrawerId(null)}
      />
    </div>
  );
}
