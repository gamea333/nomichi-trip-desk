"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-b border-sand/50 bg-cream"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className={cn(
            "text-lg font-bold tracking-wide transition-colors sm:text-xl",
            scrolled ? "text-rust" : "text-white"
          )}
        >
          NOMICHI
        </Link>
        <Link
          href="/admin/login"
          className={cn(
            "touch-target inline-flex items-center rounded px-4 py-2 text-sm transition-colors",
            scrolled
              ? "border border-rust text-rust hover:bg-rust hover:text-white"
              : "border border-white text-white hover:bg-white hover:text-ink"
          )}
        >
          Team Login
        </Link>
      </div>
    </nav>
  );
}
