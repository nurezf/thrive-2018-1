"use client";

import { Bar, BarChart } from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useEffect } from "react";
import axios from "axios";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

//fetch last 10 days sales and display in chart count of sales per day for desktop and mobile

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export function ChartExample() {
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        await axios.get("http://localhost:8000/api/sales", {
          headers: { Authorization: "Bearer dev_token" },
        });
      } catch (error) {
        console.error("Failed to fetch sales data", error);
      }
    };
    fetchSalesData();
  }, []);

  return (
    <ChartContainer config={chartConfig} className="min-h-50 w-full">
      <BarChart accessibilityLayer data={chartData}>
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <main className="mx-auto max-w-7xl p-4">
      <div className="rounded-3xl border border-border bg-slate-50 p-6 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Analytics
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Sales Insights
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your recent sales trends and traffic performance.
          </p>
        </div>
      </div>
      <section className="mt-6">
        <ChartExample />
      </section>
    </main>
  );
}
