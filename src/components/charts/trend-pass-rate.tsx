"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatTimestamp } from "@/lib/utils";

export type TrendDatum = {
  bucketStart: string;
  passRate: number;
  modelVersion: string;
  marker?: "deploy" | "retrain";
};

type TrendPassRateProps = {
  data: TrendDatum[];
};

export function TrendPassRate({ data }: TrendPassRateProps) {
  return (
    <div className="h-72 w-full rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
        Pass Rate Trend
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis
            dataKey="bucketStart"
            tickFormatter={(value) => formatTimestamp(value)}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number, _name, item) => [
              `${(value * 100).toFixed(1)}%`,
              item.payload?.modelVersion ?? "Pass Rate",
            ]}
            labelFormatter={(label) => formatTimestamp(label)}
            contentStyle={{
              background: "rgba(15, 23, 42, 0.9)",
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.3)",
              color: "#e2e8f0",
            }}
          />
          <Line
            type="monotone"
            dataKey="passRate"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
          {data
            .filter((datum) => datum.marker)
            .map((datum) => (
              <ReferenceDot
                key={datum.bucketStart}
                x={datum.bucketStart}
                y={datum.passRate}
                r={6}
                fill={datum.marker === "deploy" ? "#facc15" : "#f97316"}
                strokeWidth={0}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
