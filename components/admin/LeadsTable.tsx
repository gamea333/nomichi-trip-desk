"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn, formatDate, formatPhone } from "@/lib/utils";

export interface LeadRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  group_type: string | null;
  status: LeadStatus;
  created_at: string;
  trip_name: string | null;
  owner_name: string | null;
}

interface LeadsTableProps {
  leads: LeadRow[];
  trips: { id: string; name: string }[];
}

export function LeadsTable({ leads, trips }: LeadsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tripFilter, setTripFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return leads.filter((lead) => {
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.email.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;
      const matchesTrip =
        tripFilter === "all" || lead.trip_name === tripFilter;
      return matchesSearch && matchesStatus && matchesTrip;
    });
  }, [leads, search, statusFilter, tripFilter]);

  return (
    <div>
      <div className="-mx-6 border-b border-sand/40 bg-white px-6 py-6 md:-mx-8 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="admin-page-title">Leads</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive/50" />
              <input
                type="search"
                placeholder="Search name, phone, email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="touch-target w-full rounded-lg border border-sand/50 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-rust/40 focus:ring-1 focus:ring-rust/30"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="touch-target rounded-lg border border-sand/50 bg-white px-3 text-sm text-ink outline-none"
            >
              <option value="all">All statuses</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={tripFilter}
              onChange={(e) => setTripFilter(e.target.value)}
              className="touch-target rounded-lg border border-sand/50 bg-white px-3 text-sm text-ink outline-none"
            >
              <option value="all">All trips</option>
              {trips.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <a
              href="/api/leads/export"
              className="touch-target inline-flex items-center rounded-lg bg-rust px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Export CSV
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-sand/30 bg-white">
        {leads.length === 0 ? (
          <p className="py-8 text-center text-sm text-olive/70">
            No leads yet. They will show up here as soon as someone enquires.
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-olive/70">
            Nothing matches that filter. Try a different status or trip.
          </p>
        ) : (
          <table className="w-full text-sm lg:min-w-[800px]">
            <thead>
              <tr className="bg-sand/20 text-left text-olive/70">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Phone
                </th>
                <th className="px-4 py-3 font-medium">Trip name</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  Group type
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  Owner
                </th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Date received
                </th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, index) => (
                <tr
                  key={lead.id}
                  className={cn(
                    "cursor-pointer border-t border-sand/20 transition-colors hover:bg-admin/50",
                    index % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]"
                  )}
                  onClick={() =>
                    (window.location.href = `/admin/leads/${lead.id}`)
                  }
                >
                  <td className="px-4 py-3 font-medium text-ink">{lead.name}</td>
                  <td className="hidden px-4 py-3 text-ink/80 md:table-cell">
                    {formatPhone(lead.phone)}
                  </td>
                  <td className="px-4 py-3 text-ink/80">
                    {lead.trip_name || "—"}
                  </td>
                  <td className="hidden px-4 py-3 capitalize text-ink/80 lg:table-cell">
                    {lead.group_type || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-ink/80 lg:table-cell">
                    {lead.owner_name || "Unassigned"}
                  </td>
                  <td className="hidden px-4 py-3 text-ink/80 md:table-cell">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="touch-target inline-flex items-center rounded-lg border border-rust px-3 py-1 text-sm text-rust transition-colors hover:bg-rust hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
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
