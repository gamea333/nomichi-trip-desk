"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { tripSchema, type TripInput } from "@/lib/validations";
import { upsertTrip } from "@/app/actions";
import type { Trip } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TripFormProps {
  trip?: Trip;
}

export function TripForm({ trip }: TripFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TripInput>({
    resolver: zodResolver(tripSchema),
    defaultValues: trip
      ? {
          id: trip.id,
          name: trip.name,
          destination: trip.destination,
          start_date: trip.start_date,
          end_date: trip.end_date,
          price_incl_gst: Number(trip.price_incl_gst),
          total_seats: trip.total_seats,
          seats_left: trip.seats_left,
          status: trip.status,
          description: trip.description || "",
        }
      : {
          status: "open",
          total_seats: 10,
          seats_left: 10,
          price_incl_gst: 10000,
        },
  });

  const status = watch("status");
  const description = watch("description") || "";

  const onSubmit = async (data: TripInput) => {
    setLoading(true);
    setError(null);
    try {
      await upsertTrip(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trip");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-card max-w-2xl space-y-6">
      {trip && (
        <p className="text-sm text-olive/60">
          Added on{" "}
          {new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(new Date(trip.created_at))}
        </p>
      )}

      {trip && <input type="hidden" {...register("id")} />}

      <div>
        <label className="mb-2 block text-sm font-medium text-ink">
          Trip name
        </label>
        <input
          {...register("name")}
          className="w-full rounded-lg border border-sand/50 bg-white px-3 py-2 text-sm text-ink"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-rust">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink">
          Destination
        </label>
        <input
          {...register("destination")}
          className="w-full rounded-lg border border-sand/50 bg-white px-3 py-2 text-sm text-ink"
        />
        {errors.destination && (
          <p className="mt-1 text-sm text-rust">{errors.destination.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            Start date
          </label>
          <input
            type="date"
            {...register("start_date")}
            className="w-full rounded-lg border border-sand/50 bg-white px-3 py-2 text-sm text-ink"
          />
          {errors.start_date && (
            <p className="mt-1 text-sm text-rust">{errors.start_date.message}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            End date
          </label>
          <input
            type="date"
            {...register("end_date")}
            className="w-full rounded-lg border border-sand/50 bg-white px-3 py-2 text-sm text-ink"
          />
          {errors.end_date && (
            <p className="mt-1 text-sm text-rust">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            Price incl. GST
          </label>
          <input
            type="number"
            {...register("price_incl_gst", { valueAsNumber: true })}
            className="w-full rounded-lg border border-sand/50 bg-white px-3 py-2 text-sm text-ink"
          />
          {errors.price_incl_gst && (
            <p className="mt-1 text-sm text-rust">
              {errors.price_incl_gst.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            Total seats
          </label>
          <input
            type="number"
            {...register("total_seats", { valueAsNumber: true })}
            className="w-full rounded-lg border border-sand/50 bg-white px-3 py-2 text-sm text-ink"
          />
          {errors.total_seats && (
            <p className="mt-1 text-sm text-rust">
              {errors.total_seats.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            Seats left
          </label>
          <input
            type="number"
            {...register("seats_left", { valueAsNumber: true })}
            className="w-full rounded-lg border border-sand/50 bg-white px-3 py-2 text-sm text-ink"
          />
          {errors.seats_left && (
            <p className="mt-1 text-sm text-rust">
              {errors.seats_left.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink">Status</label>
        <div className="flex gap-2">
          {(["open", "closed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue("status", s, { shouldValidate: true })}
              className={cn(
                "rounded-full px-4 py-2 text-sm capitalize transition-colors",
                status === s
                  ? "bg-rust text-white"
                  : "border border-sand/50 bg-white text-ink"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <input type="hidden" {...register("status")} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          maxLength={300}
          className="w-full resize-none rounded-lg border border-sand/50 bg-white px-3 py-2 text-sm text-ink"
        />
        <p className="mt-1 text-xs text-sand">{description.length}/300</p>
        {errors.description && (
          <p className="mt-1 text-sm text-rust">{errors.description.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-rust">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-rust px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Saving..." : trip ? "Update trip" : "Create trip"}
      </button>
    </form>
  );
}
