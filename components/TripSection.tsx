"use client";

import { useState } from "react";
import type { Trip } from "@/lib/types";
import { formatDateRange, formatPriceInclGst } from "@/lib/utils";
import { EnquiryForm } from "./EnquiryForm";

interface TripSectionProps {
  trips: Trip[];
}

export function TripSection({ trips }: TripSectionProps) {
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>(
    trips[0]?.id
  );

  function handleEnquire(tripId: string) {
    setSelectedTripId(tripId);
    setTimeout(() => {
      document.getElementById("enquire")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  return (
    <>
      <section id="trips" className="bg-cream px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-ink">Open trips</h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-rust" />
          </div>

          {trips.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <span
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-rust/15"
                aria-hidden
              >
                <span className="h-3 w-3 rounded-full bg-rust" />
              </span>
              <p className="max-w-sm text-ink">
                No trips are open right now. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <article
                  key={trip.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-sand/40 bg-cream shadow-md"
                >
                  <div className="h-1 bg-rust" />
                  <div className="flex flex-1 flex-col p-8">
                    <h3 className="text-xl font-bold text-ink md:text-2xl">
                      {trip.destination}
                    </h3>
                    <p className="mt-1 text-sand">{trip.name}</p>

                    <p className="mt-4 text-sm text-ink/80">
                      {formatDateRange(trip.start_date, trip.end_date)}
                    </p>

                    <p className="mt-3 text-lg font-bold text-rust">
                      {formatPriceInclGst(Number(trip.price_incl_gst))}
                    </p>

                    <p className="mt-1 text-sm text-olive">
                      {trip.seats_left} seats left
                    </p>

                    {trip.description && (
                      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/80">
                        {trip.description}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleEnquire(trip.id)}
                      className="touch-target mt-8 w-full rounded-xl bg-rust py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Enquire about this trip
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {trips.length > 0 && (
        <EnquiryForm trips={trips} selectedTripId={selectedTripId} />
      )}
    </>
  );
}
