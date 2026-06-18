export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "VIBE CHECK SENT",
  "CONFIRMED",
  "NOT A FIT",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const GROUP_TYPES = ["solo", "friends", "couple", "family"] as const;

export type GroupType = (typeof GROUP_TYPES)[number];

export const STATUS_BADGE_STYLES: Record<LeadStatus, string> = {
  NEW: "bg-[#D1B788] text-[#1C1B1A]",
  CONTACTED: "bg-[#45471D] text-white",
  QUALIFIED: "bg-[#D55D27] text-white",
  "VIBE CHECK SENT": "bg-[#FFFE00] text-[#1C1B1A]",
  CONFIRMED: "bg-[#16a34a] text-white",
  "NOT A FIT": "bg-[#6b7280] text-white",
};

export function resolveLeadStatus(status: string): LeadStatus {
  const match = LEAD_STATUSES.find((s) => s === status);
  if (match) return match;

  const normalized = status.trim().toUpperCase();
  const fuzzy = LEAD_STATUSES.find((s) => s.toUpperCase() === normalized);
  return fuzzy ?? "NEW";
}

export function getStatusBadgeStyle(status: string): string {
  return STATUS_BADGE_STYLES[resolveLeadStatus(status)];
}
