"use client";

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = ["#22d3ee", "#f87171"];

export type DonutDataPoint = {
  label: string;
  value: number;
};

type DonutOkNgProps = {
  data: DonutDataPoint[];
  onSelect?: (label: string) => void;
};

export function DonutOkNg({ data, onSelect }: DonutOkNgProps) {
  return (
    <div className="h-64 w-full rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
        OK vs NG
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
            onClick={(entry) => onSelect?.(entry.label as string)}
          >
            {data.map((_entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, _name, entry) => [
              value.toLocaleString(),
              entry.payload?.label,
            ]}
            contentStyle={{
              background: "rgba(15, 23, 42, 0.9)",
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.3)",
              color: "#e2e8f0",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
