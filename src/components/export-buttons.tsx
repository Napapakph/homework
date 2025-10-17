"use client";

import { useState } from "react";
type ExportButtonsProps = {
  filters: Record<string, string | undefined>;
  selectedIds?: string[];
};

export function ExportButtons({
  filters,
  selectedIds = [],
}: ExportButtonsProps) {
  const [loading, setLoading] = useState<"csv" | "pdf" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function buildQueryString() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    if (selectedIds.length > 0) {
      params.set("ids", selectedIds.join(","));
    }
    return params.toString();
  }

  async function handleCsvExport() {
    setLoading("csv");
    setMessage(null);
    try {
      const query = buildQueryString();
      const response = await fetch(`/api/export/csv?${query}`);
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "inspections.csv";
      link.click();
      URL.revokeObjectURL(url);
      setMessage("CSV export downloaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setLoading(null);
    }
  }

  async function handlePdfExport() {
    setLoading("pdf");
    setMessage(null);
    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters,
          items: selectedIds,
        }),
      });
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const json = await response.json();
      setMessage(json.data?.message ?? "PDF export queued.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleCsvExport}
        disabled={loading === "csv"}
        className="inline-flex items-center rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900 disabled:opacity-60"
      >
        {loading === "csv" ? "Exporting..." : "Export CSV"}
      </button>
      <button
        onClick={handlePdfExport}
        disabled={loading === "pdf"}
        className="inline-flex items-center rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900 disabled:opacity-60"
      >
        {loading === "pdf" ? "Queuing..." : "Export PDF"}
      </button>
      {message ? (
        <p className="text-xs text-slate-400">{message}</p>
      ) : null}
    </div>
  );
}
