"use client";

import Link from "next/link";

export default function LeadDetailError() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <p className="text-lg text-ink">Could not load this lead.</p>
      <Link
        href="/admin/leads"
        className="touch-target mt-4 inline-flex items-center text-rust hover:underline"
      >
        Back to leads
      </Link>
    </div>
  );
}
