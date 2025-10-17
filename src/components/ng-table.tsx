"use client";

import {
  ColumnDef,
  getCoreRowModel,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { InspectionListItem } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

type NgTableProps = {
  data: InspectionListItem[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
  onSelectionChange?: (ids: string[]) => void;
  title?: string;
};

export function NgTable({
  data,
  loading = false,
  onRowClick,
  onSelectionChange,
  title = "Inspection Events",
}: NgTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onSelectionChange) return;
    const selectedIds = Object.entries(rowSelection)
      .filter(([, value]) => value)
      .map(([key]) => key);
    onSelectionChange(selectedIds);
  }, [rowSelection, onSelectionChange]);

  const columns = useMemo<ColumnDef<InspectionListItem>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all"
            className="h-4 w-4 accent-cyan-500"
            checked={
              data.length > 0 && Object.values(rowSelection).every(Boolean)
            }
            onChange={(event) => {
              const checked = event.target.checked;
              const nextSelection: Record<string, boolean> = {};
              if (checked) {
                data.forEach((row) => {
                  nextSelection[row.id] = true;
                });
              }
              setRowSelection(nextSelection);
            }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="h-4 w-4 accent-cyan-500"
            checked={rowSelection[row.original.id] ?? false}
            onChange={(event) => {
              const checked = event.target.checked;
              setRowSelection((prev) => ({
                ...prev,
                [row.original.id]: checked,
              }));
            }}
            onClick={(event) => event.stopPropagation()}
          />
        ),
        size: 48,
      },
      {
        accessorKey: "capturedAt",
        header: "Time",
        cell: (info) => (
          <span className="font-mono text-xs text-slate-300">
            {formatTimestamp(info.getValue<string>())}
          </span>
        ),
        size: 180,
      },
      {
        accessorKey: "serial",
        header: "Serial",
        cell: (info) => (
          <span className="font-mono text-xs text-slate-100">
            {info.getValue<string>()}
          </span>
        ),
        size: 180,
      },
      {
        accessorKey: "station",
        header: "Station",
        cell: (info) => (
          <span className="text-sm text-slate-300">{info.getValue<string>()}</span>
        ),
        size: 140,
      },
      {
        accessorKey: "result",
        header: "Result",
        cell: (info) => {
          const value = info.getValue<string>();
          const isOk = value === "OK";
          return (
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                isOk
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-rose-500/10 text-rose-300"
              }`}
            >
              {value}
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: "ngCode",
        header: "NG Code",
        cell: (info) => (
          <span className="text-xs text-rose-300">{info.getValue<string>()}</span>
        ),
        size: 160,
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: (info) => (
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {info.getValue<string>()}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "confidence",
        header: "Confidence",
        cell: (info) => (
          <span className="text-xs text-slate-200">
            {(info.getValue<number>() * 100).toFixed(1)}%
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "operator",
        header: "Operator",
        cell: (info) => (
          <span className="text-xs text-slate-400">{info.getValue<string>()}</span>
        ),
        size: 140,
      },
    ],
    [data, rowSelection],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm text-slate-300">
        <span>{title}</span>
        {loading ? <span className="text-xs text-slate-500">Loading...</span> : null}
      </div>
      <div
        ref={parentRef}
        className="relative h-[420px] overflow-auto"
      >
        <table className="w-full border-separate border-spacing-y-1 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-xs uppercase tracking-wide text-slate-400"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <tr>
              <td className="p-0" colSpan={columns.length}>
                <div
                  style={{
                    height: rowVirtualizer.getTotalSize(),
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                      <div
                        key={row.id}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        className="absolute top-0 left-0 w-full"
                        style={{
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div
                          className="mx-2 mb-1 rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-2 hover:border-cyan-500/50 cursor-pointer"
                          onClick={() => onRowClick?.(row.original.id)}
                        >
                          <div className="grid grid-cols-[auto_1fr] gap-x-4">
                            {row.getVisibleCells().map((cell) => (
                              <div key={cell.id} className="px-2 py-1">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
