"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "@/app/actions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/trips", label: "Trips", icon: MapPin },
];

interface AdminShellProps {
  children: React.ReactNode;
  userEmail: string;
}

function UserAvatar({ email }: { email: string }) {
  const initial = (email[0] || "?").toUpperCase();

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-sm font-semibold text-rust">
      {initial}
    </span>
  );
}

function SidebarContent({
  pathname,
  userEmail,
  onNavigate,
  showClose,
  onClose,
}: {
  pathname: string;
  userEmail: string;
  onNavigate?: () => void;
  showClose?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      {showClose && (
        <button
          type="button"
          onClick={onClose}
          className="touch-target absolute right-4 top-4 text-cream"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      )}

      <div className="mb-10 px-4 pt-2">
        <p className="text-lg font-bold tracking-wide text-rust">NOMICHI</p>
        <p className="mt-1 text-xs text-sand">Admin</p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "touch-target flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                isActive
                  ? "bg-olive/30 font-medium text-rust"
                  : "text-cream/70 hover:bg-rust/10 hover:text-cream"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-olive/40 px-4 pt-4">
        <div className="flex items-center gap-3">
          <UserAvatar email={userEmail} />
          <p className="min-w-0 truncate text-xs text-sand">{userEmail}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="touch-target mt-3 text-xs text-cream/50 transition-colors hover:text-cream"
          >
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[260px] flex-col border-r-2 border-rust bg-ink px-4 py-8 lg:flex">
        <SidebarContent pathname={pathname} userEmail={userEmail} />
      </aside>

      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b-2 border-rust bg-ink px-4 lg:hidden">
        <p className="font-bold text-rust">NOMICHI</p>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="touch-target inline-flex items-center justify-center text-cream"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="relative flex h-full w-[260px] flex-col border-r-2 border-rust bg-ink px-4 py-8">
            <SidebarContent
              pathname={pathname}
              userEmail={userEmail}
              onNavigate={() => setMobileOpen(false)}
              showClose
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="admin-main flex-1 lg:ml-[260px]">
        <div className="pt-14 lg:pt-0">{children}</div>
      </div>
    </div>
  );
}
