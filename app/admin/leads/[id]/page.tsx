import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeadDetailClient } from "@/components/admin/LeadDetailClient";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ActivityEntry, CallLog, Lead, Profile, Trip } from "@/lib/types";
import type { LeadStatus } from "@/lib/constants";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("name")
    .eq("id", params.id)
    .single();

  return {
    title: lead?.name
      ? `Nomichi Admin | ${lead.name}`
      : "Nomichi Admin | Lead",
  };
}

export default async function LeadDetailPage({ params }: PageProps) {
  const supabase = await createClient();

  const [
    { data: lead, error },
    { data: callLogs },
    { data: activities },
    { data: profiles },
  ] = await Promise.all([
    supabase.from("leads").select("*").eq("id", params.id).single(),
    supabase
      .from("call_logs")
      .select(`*, creator:profiles!call_logs_created_by_fkey(full_name)`)
      .eq("lead_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("activity_timeline")
      .select(
        `*, performer:profiles!activity_timeline_performed_by_fkey(full_name)`
      )
      .eq("lead_id", params.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, email, role"),
  ]);

  if (error || !lead) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-lg text-ink">Could not load this lead.</p>
        <Link
          href="/admin/leads"
          className="touch-target mt-4 inline-flex items-center text-rust hover:underline"
        >
          Back to leads
        </Link>
      </div>
    );
  }

  let trip: Trip | null = null;
  if (lead.trip_id) {
    const { data } = await supabase
      .from("trips")
      .select("*")
      .eq("id", lead.trip_id)
      .single();
    trip = data as Trip | null;
  }

  return (
    <div className="p-6 md:p-8">
      <Link
        href="/admin/leads"
        className="mb-6 inline-block text-sm text-rust hover:underline"
      >
        ← Back to leads
      </Link>

      <div className="mb-6">
        <StatusBadge status={lead.status as LeadStatus} />
      </div>

      <LeadDetailClient
        lead={lead as Lead}
        trip={trip}
        callLogs={(callLogs as CallLog[]) || []}
        activities={(activities as ActivityEntry[]) || []}
        profiles={(profiles as Profile[]) || []}
      />
    </div>
  );
}
