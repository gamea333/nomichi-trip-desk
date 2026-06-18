import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LeadsTable, type LeadRow } from "@/components/admin/LeadsTable";
import type { LeadStatus } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Nomichi Admin | Leads",
};

export default async function LeadsPage() {
  const supabase = await createClient();

  const [{ data: leads }, { data: trips }] = await Promise.all([
    supabase
      .from("leads")
      .select(
        `
        id,
        name,
        phone,
        email,
        group_type,
        status,
        created_at,
        trips (name),
        owner:profiles!leads_owner_id_fkey (full_name, email)
      `
      )
      .order("created_at", { ascending: false }),
    supabase.from("trips").select("id, name").order("name"),
  ]);

  const rows: LeadRow[] = (leads || []).map((lead) => {
    const tripRaw = lead.trips;
    const trip = Array.isArray(tripRaw) ? tripRaw[0] : tripRaw;
    const ownerRaw = lead.owner;
    const owner = Array.isArray(ownerRaw) ? ownerRaw[0] : ownerRaw;

    return {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      group_type: lead.group_type,
      status: lead.status as LeadStatus,
      created_at: lead.created_at,
      trip_name: (trip as { name: string } | null | undefined)?.name || null,
      owner_name:
        (owner as { full_name: string | null; email: string | null } | null | undefined)
          ?.full_name ||
        (owner as { full_name: string | null; email: string | null } | null | undefined)
          ?.email ||
        null,
    };
  });

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <LeadsTable leads={rows} trips={trips || []} />
    </div>
  );
}
