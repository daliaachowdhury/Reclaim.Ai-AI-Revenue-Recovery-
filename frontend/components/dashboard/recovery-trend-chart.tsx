"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const trendData = [
  { date: "Mon", recovered: 4200, attempts: 24, successful: 18 },
  { date: "Tue", recovered: 5200, attempts: 28, successful: 22 },
  { date: "Wed", recovered: 4800, attempts: 26, successful: 20 },
  { date: "Thu", recovered: 6200, attempts: 32, successful: 26 },
  { date: "Fri", recovered: 7100, attempts: 35, successful: 30 },
  { date: "Sat", recovered: 5900, attempts: 30, successful: 25 },
  { date: "Sun", recovered: 4100, attempts: 22, successful: 18 },
];

export function RecoveryTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value) => `$${value}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="recovered"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: "#10b981", r: 4 }}
          activeDot={{ r: 6 }}
          name="Amount Recovered"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
