"use client";

import { ResponsiveContainer, AreaChart, Area, Tooltip, YAxis } from "recharts";

interface Props {
  data: (number | null)[];
  positive: boolean;
  height?: number;
}

export default function PriceSparkline({ data, positive, height = 40 }: Props) {
  const clean = data.map((v, i) => ({ v: v ?? undefined, i }));
  const color = positive ? "#22c55e" : "#ef4444";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={clean} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={["auto", "auto"]} hide />
        <Tooltip
          contentStyle={{ background: "#1a1a2e", border: "none", fontSize: 11 }}
          itemStyle={{ color }}
          formatter={(v) => {
            const num = typeof v === "number" ? v : Number(v);
            return [`${num.toFixed(2)}c`, "Preço"] as [string, string];
          }}
          labelFormatter={() => ""}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sg-${positive})`}
          dot={false}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
