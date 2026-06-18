import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TripForm } from "@/components/TripForm";
import type { Trip } from "@/lib/types";

export default async function EditTripPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !trip) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8">
      <Link
        href="/admin/trips"
        className="mb-6 inline-block text-sm text-rust hover:underline"
      >
        ← Back to trips
      </Link>
      <h1 className="admin-page-title mb-6">Edit Trip</h1>
      <TripForm trip={trip as Trip} />
    </div>
  );
}
