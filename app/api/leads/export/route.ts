import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { escapeCsvField, formatDate } from "@/lib/utils";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: leads, error } = await supabase
    .from("leads")
    .select(
      `
      name,
      phone,
      email,
      group_type,
      preferred_month,
      status,
      vibe_note,
      created_at,
      trips (name),
      owner:profiles!leads_owner_id_fkey (full_name, email)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
  }

  const headers = [
    "Name",
    "Phone",
    "Email",
    "Trip",
    "Group Type",
    "Preferred Month",
    "Status",
    "Owner",
    "Received Date",
    "Vibe Note",
  ];

  const rows = (leads || []).map((lead) => {
    const tripRaw = lead.trips;
    const trip = Array.isArray(tripRaw) ? tripRaw[0] : tripRaw;
    const ownerRaw = lead.owner;
    const owner = Array.isArray(ownerRaw) ? ownerRaw[0] : ownerRaw;
    const ownerRecord = owner as {
      full_name: string | null;
      email: string | null;
    } | null | undefined;
    const tripRecord = trip as { name: string } | null | undefined;
    const ownerName = ownerRecord?.full_name || ownerRecord?.email || "Unassigned";

    return [
      lead.name,
      lead.phone,
      lead.email,
      tripRecord?.name || "",
      lead.group_type || "",
      lead.preferred_month || "",
      lead.status,
      ownerName,
      formatDate(lead.created_at),
      lead.vibe_note || "",
    ]
      .map(escapeCsvField)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="nomichi-leads.csv"',
    },
  });
}
