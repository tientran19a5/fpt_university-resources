"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatVND } from "@/lib/utils";

interface RevenueDataPoint {
  date: string;
  dayName: string;
  revenue: number;
  ordersCount: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[280px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
          <XAxis
            dataKey="dayName"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(val) => {
              if (val >= 1000000) return `${(val / 1000000).toFixed(1)}Tr`;
              if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
              return `${val}`;
            }}
          />
          <Tooltip
            cursor={{ fill: "rgba(14, 165, 233, 0.08)" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as RevenueDataPoint;
                return (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-lg text-xs space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {item.dayName} ({item.date})
                    </p>
                    <p className="text-sky-600 dark:text-sky-400 font-bold text-sm">
                      {formatVND(item.revenue)}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {item.ordersCount} xe hoàn thành
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="revenue"
            fill="#0284c7"
            className="fill-sky-600 dark:fill-sky-500"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
