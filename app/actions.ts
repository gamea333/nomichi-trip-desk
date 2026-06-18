"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LeadStatus } from "@/lib/constants";
import { tripSchema, type TripInput } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { success: false; error: string };

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
): Promise<ActionResult> {
  const { user } = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("leads")
    .update({ status })
    .eq("id", leadId)
    .select("id, status")
    .single();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Lead not found or update failed" };

  const { error: timelineError } = await admin.from("activity_timeline").insert({
    lead_id: leadId,
    action: "STATUS_CHANGED",
    detail: `Status updated to ${status}`,
    performed_by: user.id,
  });

  if (timelineError) return { success: false, error: timelineError.message };

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function assignOwner(
  leadId: string,
  ownerId: string | null
): Promise<ActionResult> {
  const { user } = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const admin = createAdminClient();

  const { error } = await admin
    .from("leads")
    .update({ owner_id: ownerId || null })
    .eq("id", leadId);

  if (error) return { success: false, error: error.message };

  let detail = "Owner unassigned";
  if (ownerId) {
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", ownerId)
      .single();
    detail = `Assigned to ${profile?.full_name || profile?.email || ownerId}`;
  }

  const { error: timelineError } = await admin.from("activity_timeline").insert({
    lead_id: leadId,
    action: "OWNER_ASSIGNED",
    detail,
    performed_by: user.id,
  });

  if (timelineError) return { success: false, error: timelineError.message };

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  return { success: true };
}

export async function addCallLog(
  leadId: string,
  note: string,
  nextAction?: string
): Promise<ActionResult> {
  const { user } = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const admin = createAdminClient();

  const { error } = await admin.from("call_logs").insert({
    lead_id: leadId,
    note,
    next_action: nextAction || null,
    created_by: user.id,
  });

  if (error) return { success: false, error: error.message };

  const { error: timelineError } = await admin.from("activity_timeline").insert({
    lead_id: leadId,
    action: "NOTE_ADDED",
    detail: note.slice(0, 120),
    performed_by: user.id,
  });

  if (timelineError) return { success: false, error: timelineError.message };

  revalidatePath(`/admin/leads/${leadId}`);
  return { success: true };
}

export async function upsertTrip(data: TripInput): Promise<void> {
  const parsed = tripSchema.parse(data);
  const { user } = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const admin = createAdminClient();

  const payload = {
    name: parsed.name,
    destination: parsed.destination,
    start_date: parsed.start_date,
    end_date: parsed.end_date,
    price_incl_gst: parsed.price_incl_gst,
    total_seats: parsed.total_seats,
    seats_left: parsed.seats_left,
    status: parsed.status,
    description: parsed.description || null,
  };

  if (parsed.id) {
    const { error } = await admin
      .from("trips")
      .update(payload)
      .eq("id", parsed.id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/trips");
    revalidatePath(`/admin/trips/${parsed.id}/edit`);
    redirect("/admin/trips");
  }

  const { error } = await admin.from("trips").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/trips");
  redirect("/admin/trips");
}
