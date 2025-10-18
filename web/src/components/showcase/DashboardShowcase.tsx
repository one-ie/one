'use client';

import { SectionCards } from '@/components/dashboard/section-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';

export function DashboardShowcase() {
  return (
    <div className="flex flex-col gap-8 rounded-3xl border border-border/80 bg-background/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur-sm lg:p-8">
      <div className="space-y-6 text-left">
        <span className="text-xs font-semibold uppercase tracking-[0.2rem] text-primary/70">
          Executive Command
        </span>
        <h3 className="text-2xl font-semibold leading-tight sm:text-3xl">
          Data-rich dashboards without scaffolding
        </h3>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          Stats tiles, micro-interactions, and live charts land with one import.
          Swap datasets, keep the same cinematic presentation.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <SectionCards />
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart />
          <ActivityChart />
        </div>
        <RecentTransactions />
      </div>
    </div>
  );
}
