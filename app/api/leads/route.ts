import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        name: data.name,
        phone: data.phone,
        email: data.email,
        trip_id: data.trip_id,
        group_type: data.group_type,
        preferred_month: data.preferred_month,
        vibe_note: data.vibe_note || null,
        status: "NEW",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Lead insert error:", error);
      return NextResponse.json({ error: "Failed to save enquiry" }, { status: 500 });
    }

    await supabase.from("activity_timeline").insert({
      lead_id: lead.id,
      action: "LEAD_CREATED",
      detail: "Enquiry received from public form",
      performed_by: null,
    });

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (err) {
    console.error("Leads API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
