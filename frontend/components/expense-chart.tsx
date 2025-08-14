"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface ExpenseChartProps {
  data: Record<string, number>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function ExpenseChart({ data }: ExpenseChartProps) {
  const chartData = Object.entries(data).map(([category, amount]) => ({
    name: category,
    value: amount,
  }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`€${Number(value).toFixed(2)}`, "Cantidad"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
