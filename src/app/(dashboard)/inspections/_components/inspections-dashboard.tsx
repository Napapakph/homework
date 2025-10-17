"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiltersBar, FilterState } from "@/components/filters-bar";
import { NgTable } from "@/components/ng-table";
import { ExportButtons } from "@/components/export-buttons";
import { InspectionDrawer } from "@/components/inspection-drawer";
import {
  InspectionRecord,
  InspectionListItem,
  PaginatedResponse,
} from "@/lib/types";

type InspectionsResponse = PaginatedResponse<InspectionListItem>;

type InspectionDetailResponse = {
  data: InspectionRecord;
};

type AdvancedFilters = {
  result?: string;
  ngCode?: string;
  serial?: string;
  workOrder?: string;
};

function buildQuery(
  filters: FilterState,
  advanced: AdvancedFilters,
  cursor?: string,
) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  Object.entries(advanced).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  if (cursor) {
    params.set("cursor", cursor);
  }
  return params.toString();
}

export function InspectionsDashboard() {
  const [filters, setFilters] = useState<FilterState>({});
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const queryKey = useMemo(
    () => ["inspections", filters, advancedFilters, cursor],
    [filters, advancedFilters, cursor],
  );

  const inspectionsQuery = useQuery<InspectionsResponse>({
    queryKey,
    queryFn: async ({ queryKey }) => {
      const [, stateFilters, stateAdvanced, stateCursor] = queryKey as [
        string,
        FilterState,
        AdvancedFilters,
        string | undefined,
      ];
          const response = await fetch(
            `/api/inspections?${buildQuery(stateFilters, stateAdvanced, stateCursor)}`,
          );
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

  const inspections = inspectionsQuery.data?.data ?? [];
  const nextCursor = inspectionsQuery.data?.nextCursor;

  function handleAdvancedChange(
    key: keyof AdvancedFilters,
    value: string,
  ) {
    setAdvancedFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
    setCursor(undefined);
  }

  return (
    <div className="space-y-8">
      <FiltersBar
        filters={filters}
        onFiltersChange={(next) => {
          setFilters(next);
          setCursor(undefined);
        }}
        showSearch
      />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Serial
          </label>
          <input
            value={advancedFilters.serial ?? ""}
            onChange={(event) =>
              handleAdvancedChange("serial", event.target.value)
            }
            placeholder="AC25..."
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Work Order
          </label>
          <input
            value={advancedFilters.workOrder ?? ""}
            onChange={(event) =>
              handleAdvancedChange("workOrder", event.target.value)
            }
            placeholder="WO-"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Result
          </label>
          <select
            value={advancedFilters.result ?? ""}
            onChange={(event) =>
              handleAdvancedChange("result", event.target.value)
            }
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            <option value="">All</option>
            <option value="OK">OK</option>
            <option value="NG">NG</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            NG Code
          </label>
          <select
            value={advancedFilters.ngCode ?? ""}
            onChange={(event) =>
              handleAdvancedChange("ngCode", event.target.value)
            }
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            <option value="">Any</option>
            <option value="SCR_MISSING">SCR_MISSING</option>
            <option value="SCR_WRONG_TYPE">SCR_WRONG_TYPE</option>
            <option value="LBL_MISSING">LBL_MISSING</option>
            <option value="LBL_MISREAD">LBL_MISREAD</option>
            <option value="DRW_MISALIGN">DRW_MISALIGN</option>
            <option value="COS_SCRATCH">COS_SCRATCH</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <ExportButtons
          filters={{ ...filters, ...advancedFilters }}
          selectedIds={selectedRows}
        />
        {nextCursor ? (
          <button
            onClick={() => setCursor(nextCursor)}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-900"
          >
            Load more
          </button>
        ) : null}
      </div>

      <NgTable
        data={inspections}
        loading={inspectionsQuery.isFetching}
        onRowClick={(id) => setDrawerId(id)}
        onSelectionChange={setSelectedRows}
        title="Inspection Results"
      />

      <InspectionDrawer
        open={Boolean(drawerId)}
        inspection={inspectionDetailQuery.data?.data}
        onClose={() => setDrawerId(null)}
      />
    </div>
  );
}
