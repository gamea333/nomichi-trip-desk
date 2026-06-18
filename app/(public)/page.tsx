import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublicNavbar } from "@/components/PublicNavbar";
import { TripSection } from "@/components/TripSection";
import type { Trip } from "@/lib/types";

export const dynamic = "force-dynamic";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920";

export default async function PublicPage() {
  const supabase = await createClient();
  const { data: trips, error } = await supabase
    .from("trips")
    .select("*")
    .eq("status", "open")
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Trips fetch error:", error);
  }

  return (
    <div className="min-h-screen bg-cream">
      <PublicNavbar />

      <section
        id="hero"
        className="relative flex min-h-[85vh] items-center justify-center"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-ink/60" aria-hidden />

        <div className="relative z-10 px-6 text-center">
          <h1 className="text-3xl font-black uppercase tracking-widest text-white md:text-5xl">
            Travel that finds you
          </h1>
          <p className="mt-5 text-lg tracking-wide text-sand">
            Slow journeys. Real places. Good company.
          </p>
          <a
            href="#trips"
            className="touch-target mt-10 inline-flex items-center rounded-xl bg-rust px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            See open trips
          </a>
        </div>
      </section>

      {error ? (
        <div className="px-6 py-16 text-center">
          <p className="text-ink">
            Something went wrong loading trips. Please refresh the page.
          </p>
        </div>
      ) : (
        <TripSection trips={(trips as Trip[]) || []} />
      )}

      <footer className="bg-ink px-8 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-sm text-sand md:flex-row md:justify-between">
          <p className="font-bold tracking-wide text-rust">NOMICHI</p>
          <p className="text-center">Wander · Connect · Belong</p>
          <Link
            href="/admin/login"
            className="text-sand transition-colors hover:underline"
          >
            Team Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
