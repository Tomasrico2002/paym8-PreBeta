"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface Balance {
  member: string
  balance: number
}

interface BalanceChartProps {
  data: Balance[]
}

export function BalanceChart({ data }: BalanceChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="member" />
          <YAxis />
          <Tooltip formatter={(value) => [`€${Number(value).toFixed(2)}`, "Balance"]} />
          <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.balance >= 0 ? "#10B981" : "#EF4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
