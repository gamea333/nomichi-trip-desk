import { LEAD_STATUSES, type LeadStatus } from "./constants";

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startStr = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(startDate);
  const endStr = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(endDate);
  return `${startStr} - ${endStr}`;
}

export function formatPhone(phone: string) {
  if (phone.length !== 10) return phone;
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export function formatPriceInclGst(amount: number) {
  return `${formatCurrency(amount)} incl. GST`;
}

export function getNextMonths(count = 8): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en-IN", {
      month: "long",
      year: "numeric",
    }).format(d);
    months.push({ value, label });
  }
  return months;
}

export function getStatusIndex(status: LeadStatus) {
  return LEAD_STATUSES.indexOf(status);
}

export function escapeCsvField(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
