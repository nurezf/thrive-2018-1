"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  MessageSquare,
  PlaySquare,
  Calendar,
  Plus,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Formats percentage change into a display string
 * @param change - Percentage change as a number (e.g., 12.5 or -5.2)
 * @returns Formatted string (e.g., "+12.5%" or "-5.2%")
 */
function formatPercentageChange(change: number): string {
  if (change === 0) return "0%";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

function DashboardHome() {
  // State management

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quickActions = [
    {
      title: "Add Teaching",
      href: "/admin/dashboard/teachings/new",
      icon: BookOpen,
    },
    {
      title: "Add Fetwa",
      href: "/admin/dashboard/fetwas",
      icon: MessageSquare,
    },
    {
      title: "Add Event",
      href: "/admin/dashboard/events",
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here an overview of your content.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="size-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="ml-auto"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="size-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))
          : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Add new content to your website</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="justify-start"
                >
                  <Link href={action.href}>
                    <Plus className="mr-2 size-4" />
                    <Icon className="mr-2 size-4" />
                    {action.title}
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verse of the Day</CardTitle>
            <CardDescription>Daily inspiration from the Quran</CardDescription>
          </CardHeader>
          <CardContent>
            <blockquote className="border-l-4 border-primary pl-4 italic">
              <p className="text-lg leading-relaxed mb-2">
                Indeed, Allah is with those who fear Him and those who are doers
                of good
              </p>
              <footer className="text-sm text-muted-foreground font-medium">
                — Quran 16:128
              </footer>
            </blockquote>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardHome;
