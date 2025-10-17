"use client";

import { ChangeEvent } from "react";
import { Station } from "@/lib/types";

export type FilterState = {
  from?: string;
  to?: string;
  line?: string;
  station?: Station | "all";
  model?: string;
  search?: string;
};

type FiltersBarProps = {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  lines?: string[];
  stations?: Station[];
  models?: string[];
  showSearch?: boolean;
};

export function FiltersBar({
  filters,
  onFiltersChange,
  lines = ["L1", "L2"],
  stations = ["ScrewCheck", "LabelOCR", "DrawingConform"],
  models = ["HVAC-X100", "HVAC-Z200"],
  showSearch = false,
}: FiltersBarProps) {
  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    onFiltersChange({
      ...filters,
      [name]: value === "" ? undefined : value,
    });
  }

  return (
    <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-5">
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-slate-400">
          From
        </label>
        <input
          type="datetime-local"
          name="from"
          value={filters.from ?? ""}
          onChange={handleInputChange}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-slate-400">
          To
        </label>
        <input
          type="datetime-local"
          name="to"
          value={filters.to ?? ""}
          onChange={handleInputChange}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Line
        </label>
        <select
          name="line"
          value={filters.line ?? ""}
          onChange={handleInputChange}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        >
          <option value="">All</option>
          {lines.map((line) => (
            <option key={line} value={line}>
              {line}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Station
        </label>
        <select
          name="station"
          value={filters.station ?? ""}
          onChange={handleInputChange}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        >
          <option value="">All</option>
          {stations.map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Model
        </label>
        <select
          name="model"
          value={filters.model ?? ""}
          onChange={handleInputChange}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        >
          <option value="">All</option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
      {showSearch ? (
        <div className="md:col-span-5 flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Search
          </label>
          <input
            name="search"
            value={filters.search ?? ""}
            onChange={handleInputChange}
            placeholder="Serial, Work Order, Operator"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
      ) : null}
    </div>
  );
}
