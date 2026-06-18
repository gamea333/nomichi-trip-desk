import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cn, formatCurrency, formatDateRange } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nomichi Admin | Trips",
};

export default async function TripsPage() {
  const supabase = await createClient();
  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: true });

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="admin-page-title">Trips</h1>
        <Link
          href="/admin/trips/new"
          className="touch-target inline-flex items-center rounded-xl bg-rust px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
        >
          New trip
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-sand/30 bg-white">
        {!trips || trips.length === 0 ? (
          <p className="py-8 text-center text-sm text-olive/60">
            No trips yet. Create the first one.
          </p>
        ) : (
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-sand/20 text-left text-olive/70">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Seats</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip, index) => (
                <tr
                  key={trip.id}
                  className={cn(
                    "border-t border-sand/20",
                    index % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]"
                  )}
                >
                  <td className="px-4 py-3 font-medium text-ink">{trip.name}</td>
                  <td className="px-4 py-3 text-ink/80">{trip.destination}</td>
                  <td className="px-4 py-3 text-ink/80">
                    {formatDateRange(trip.start_date, trip.end_date)}
                  </td>
                  <td className="px-4 py-3 text-ink/80">
                    {formatCurrency(Number(trip.price_incl_gst))}
                  </td>
                  <td className="px-4 py-3 text-ink/80">
                    {trip.seats_left} / {trip.total_seats}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        trip.status === "open"
                          ? "inline-flex rounded-full bg-rust px-3 py-1 text-xs font-medium text-white"
                          : "inline-flex rounded-full bg-[#6b7280] px-3 py-1 text-xs font-medium text-white"
                      }
                    >
                      {trip.status === "open" ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/trips/${trip.id}/edit`}
                      className="touch-target inline-flex items-center rounded-lg border border-rust px-3 py-1 text-sm text-rust transition-colors hover:bg-rust hover:text-white"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
