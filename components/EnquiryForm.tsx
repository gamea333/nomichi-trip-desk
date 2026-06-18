"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enquirySchema, type EnquiryInput } from "@/lib/validations";
import { GROUP_TYPES } from "@/lib/constants";
import type { Trip } from "@/lib/types";
import { cn, getNextMonths } from "@/lib/utils";

const inputClass =
  "touch-target w-full rounded-sm border border-sand/60 bg-white px-4 text-ink outline-none focus:border-rust/50 focus:ring-1 focus:ring-rust/30";

interface EnquiryFormProps {
  trips: Trip[];
  selectedTripId?: string;
}

export function EnquiryForm({ trips, selectedTripId }: EnquiryFormProps) {
  const [successTripName, setSuccessTripName] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const months = getNextMonths(8);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      trip_id: selectedTripId || trips[0]?.id || "",
      group_type: undefined,
      preferred_month: months[0]?.value || "",
      vibe_note: "",
    },
  });

  const vibeNote = watch("vibe_note") || "";
  const groupType = watch("group_type");

  useEffect(() => {
    if (selectedTripId) {
      setValue("trip_id", selectedTripId);
    }
  }, [selectedTripId, setValue]);

  const onSubmit = async (data: EnquiryInput) => {
    setLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const tripName =
        trips.find((t) => t.id === data.trip_id)?.name || "your trip";
      setSuccessTripName(tripName);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (successTripName) {
    return (
      <section id="enquire" className="bg-cream px-4 py-16 sm:px-6">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-sand/40 bg-cream p-10 text-center shadow-lg">
          <p className="text-xl font-bold text-rust">{successTripName}</p>
          <p className="mt-4 text-ink">
            We have your details. Someone from the Nomichi team will reach out
            within 24 hours.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="enquire" className="bg-cream px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-sand/30 bg-cream p-10 shadow-lg">
        <h2 className="text-2xl font-bold text-ink">Send an enquiry</h2>
        <p className="mt-2 text-olive/80">
          Tell us a little about yourself and what you are looking for.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Full name
            </label>
            <input {...register("name")} className={inputClass} />
            {errors.name && (
              <p className="mt-1 text-sm text-rust">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Phone
            </label>
            <input
              {...register("phone")}
              type="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              className={inputClass}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-rust">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Email
            </label>
            <input {...register("email")} type="email" className={inputClass} />
            {errors.email && (
              <p className="mt-1 text-sm text-rust">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Trip
            </label>
            <select {...register("trip_id")} className={inputClass}>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.name}
                </option>
              ))}
            </select>
            {errors.trip_id && (
              <p className="mt-1 text-sm text-rust">{errors.trip_id.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Group type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {GROUP_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setValue("group_type", type, { shouldValidate: true })
                  }
                  className={cn(
                    "touch-target rounded-full px-4 text-sm capitalize transition-colors",
                    groupType === type
                      ? "bg-rust text-white"
                      : "border border-sand/60 bg-white text-ink hover:border-rust/40"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
            <input type="hidden" {...register("group_type")} />
            {errors.group_type && (
              <p className="mt-1 text-sm text-rust">
                {errors.group_type.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Preferred month
            </label>
            <select {...register("preferred_month")} className={inputClass}>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {errors.preferred_month && (
              <p className="mt-1 text-sm text-rust">
                {errors.preferred_month.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              What are you hoping this trip feels like?
            </label>
            <textarea
              {...register("vibe_note")}
              rows={4}
              maxLength={500}
              className={cn(inputClass, "min-h-[120px] resize-none py-3")}
            />
            <p className="mt-1 block text-sm text-sand">{vibeNote.length}/500</p>
            {errors.vibe_note && (
              <p className="mt-1 text-sm text-rust">{errors.vibe_note.message}</p>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-rust" role="alert">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="touch-target w-full rounded-xl bg-rust text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send enquiry"}
          </button>
        </form>
      </div>
    </section>
  );
}
