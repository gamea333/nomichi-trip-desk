import type { Metadata } from "next";
import {
  CheckCircle,
  Clock,
  Map as MapIcon,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = {
  title: "Nomichi Admin | Dashboard",
};

function displayCount(value: number) {
  return value === 0 ? "—" : value;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    { count: totalLeads },
    { count: confirmedLeads },
    { count: openTrips },
    { count: newThisWeek },
    { data: allLeads },
    { data: allTrips },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "CONFIRMED"),
    supabase
      .from("trips")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    supabase.from("leads").select("status, trip_id"),
    supabase.from("trips").select("id, name"),
  ]);

  const pipelineCounts = LEAD_STATUSES.reduce(
    (acc, status) => {
      acc[status] =
        allLeads?.filter((l) => l.status === status).length || 0;
      return acc;
    },
    {} as Record<LeadStatus, number>
  );

  const tripNameMap = new Map(
    (allTrips || []).map((t) => [t.id, t.name as string])
  );

  const leadsByTrip = new Map<string, number>();
  (allLeads || []).forEach((lead) => {
    if (lead.trip_id) {
      const name = tripNameMap.get(lead.trip_id) || "Unknown trip";
      leadsByTrip.set(name, (leadsByTrip.get(name) || 0) + 1);
    }
  });

  const stats = [
    { label: "Total leads", value: totalLeads ?? 0, icon: Users },
    { label: "Confirmed", value: confirmedLeads ?? 0, icon: CheckCircle },
    { label: "Open trips", value: openTrips ?? 0, icon: MapIcon },
    { label: "New this week", value: newThisWeek ?? 0, icon: Clock },
  ];

  return (
    <div className="p-6 md:p-8">
      <h1 className="admin-page-title">Dashboard</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-sand/30 bg-cream p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2 text-sm text-ink">
                <Icon className="h-4 w-4 text-rust" />
                {stat.label}
              </div>
              <p className="text-5xl font-black text-rust">
                {displayCount(stat.value)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h2 className="mb-4 font-semibold text-ink">Pipeline overview</h2>
          <div className="space-y-3">
            {LEAD_STATUSES.map((status) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-lg border border-sand/30 p-4"
              >
                <StatusBadge status={status} />
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rust text-sm font-semibold text-white">
                  {displayCount(pipelineCounts[status])}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="mb-4 font-semibold text-ink">Leads by trip</h2>
          {leadsByTrip.size === 0 ? (
            <div className="rounded-lg border border-l-4 border-l-rust border-sand/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-ink/60">—</span>
                <span className="text-ink/60">—</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from(leadsByTrip.entries()).map(([name, count]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-lg border border-sand/30 border-l-4 border-l-rust p-4"
                >
                  <span className="text-ink">{name}</span>
                  <span className="font-medium text-ink">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
