"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: (number | null)[];
  positive: boolean;
  label?: string;
}

export default function PriceChart({ data, positive, label = "Chaos" }: Props) {
  const chartData = data.map((v, i) => ({
    day: `Dia ${i + 1}`,
    value: v ?? null,
  }));

  const color = positive ? "#22c55e" : "#ef4444";
  const validValues = data.filter((v): v is number => v !== null);
  const min = Math.min(...validValues) * 0.95;
  const max = Math.max(...validValues) * 1.05;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
        <XAxis
          dataKey="day"
          tick={{ fill: "#6b7280", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[min, max]}
          tick={{ fill: "#6b7280", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v.toFixed(0)}c`}
          width={45}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a2e",
            border: `1px solid ${color}33`,
            borderRadius: "8px",
            fontSize: 12,
          }}
          labelStyle={{ color: "#9ca3af" }}
          itemStyle={{ color }}
          formatter={(v) => {
            const num = typeof v === "number" ? v : Number(v);
            return [`${num.toFixed(2)} ${label}`, "Preço"] as [string, string];
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill="url(#priceGradient)"
          dot={false}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
