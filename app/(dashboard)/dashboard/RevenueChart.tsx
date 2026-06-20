"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { day: string; revenue: number };

export function RevenueChart({ data }: { data: Point[] }) {
  return (
    <div className="h-[260px] -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5630" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#FF5630" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E9E3D6" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#8B8E97", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#8B8E97", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{ stroke: "#FF5630", strokeOpacity: 0.2, strokeWidth: 2 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E9E3D6",
              boxShadow: "0 12px 24px -8px rgba(22,24,29,.15)",
              padding: "8px 12px",
              fontSize: 12,
            }}
            labelStyle={{
              color: "#8B8E97",
              fontWeight: 700,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 4,
            }}
            formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#FF5630"
            strokeWidth={2.4}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
