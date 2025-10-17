"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ParetoDatum = {
  ngCode: string;
  count: number;
  ratio: number;
};

type ParetoNgProps = {
  data: ParetoDatum[];
};

export function ParetoNg({ data }: ParetoNgProps) {
  return (
    <div className="h-72 w-full rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
        Top NG Causes
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis dataKey="ngCode" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name) =>
              name === "ratio"
                ? [`${(value * 100).toFixed(1)}%`, "Cum. Ratio"]
                : [value, "Count"]
            }
            contentStyle={{
              background: "rgba(15, 23, 42, 0.9)",
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.3)",
              color: "#e2e8f0",
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="count"
            barSize={28}
            fill="#22d3ee"
            radius={[6, 6, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ratio"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
