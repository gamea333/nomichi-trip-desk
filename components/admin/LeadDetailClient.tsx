"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/constants";
import { updateLeadStatus, assignOwner, addCallLog } from "@/app/actions";
import {
  cn,
  formatDate,
  formatDateRange,
  formatPhone,
  getStatusIndex,
} from "@/lib/utils";
import type { ActivityEntry, CallLog, Lead, Profile, Trip } from "@/lib/types";

interface LeadDetailClientProps {
  lead: Lead;
  trip: Trip | null;
  callLogs: CallLog[];
  activities: ActivityEntry[];
  profiles: Profile[];
}

export function LeadDetailClient({
  lead,
  trip,
  callLogs,
  activities,
  profiles,
}: LeadDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [statusError, setStatusError] = useState<string | null>(null);
  const [ownerError, setOwnerError] = useState<string | null>(null);

  const [whatsappDraft, setWhatsappDraft] = useState("");
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  const [callSummary, setCallSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [vibeFit, setVibeFit] = useState<{
    fit: string;
    reason: string;
  } | null>(null);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [vibeError, setVibeError] = useState<string | null>(null);

  const [note, setNote] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [logError, setLogError] = useState<string | null>(null);
  const [addingNote, setAddingNote] = useState(false);

  const currentIndex = getStatusIndex(lead.status);

  function handleStatusChange(newStatus: LeadStatus) {
    if (newStatus === lead.status) return;

    if (newStatus === "NOT A FIT") {
      const confirmed = window.confirm(
        "Mark this lead as not a fit? You can always change this later."
      );
      if (!confirmed) return;
    }

    setStatusError(null);
    startTransition(async () => {
      const result = await updateLeadStatus(lead.id, newStatus);
      if (!result.success) {
        setStatusError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleOwnerChange(ownerId: string) {
    setOwnerError(null);
    startTransition(async () => {
      const result = await assignOwner(lead.id, ownerId || null);
      if (!result.success) {
        setOwnerError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setLogError(null);
    setAddingNote(true);

    startTransition(async () => {
      const result = await addCallLog(
        lead.id,
        note.trim(),
        nextAction.trim() || undefined
      );
      setAddingNote(false);
      if (!result.success) {
        setLogError(result.error);
        return;
      }
      setNote("");
      setNextAction("");
      router.refresh();
    });
  }

  async function handleWhatsAppDraft() {
    setWhatsappLoading(true);
    setWhatsappError(null);
    try {
      const res = await fetch("/api/ai/whatsapp-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead, trip }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setWhatsappDraft(json.draft);
    } catch {
      setWhatsappError("Failed to generate draft");
    } finally {
      setWhatsappLoading(false);
    }
  }

  async function handleCallSummary() {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetch("/api/ai/call-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: callLogs.map((l) => l.note) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCallSummary(json.summary);
    } catch (err) {
      setSummaryError(
        err instanceof Error ? err.message : "Failed to generate summary"
      );
    } finally {
      setSummaryLoading(false);
    }
  }

  async function handleVibeFit() {
    setVibeLoading(true);
    setVibeError(null);
    try {
      const res = await fetch("/api/ai/vibe-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vibe_note: lead.vibe_note,
          group_type: lead.group_type,
          preferred_month: lead.preferred_month,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setVibeFit(json);
    } catch {
      setVibeError("Failed to assess vibe fit");
    } finally {
      setVibeLoading(false);
    }
  }

  function copyDraft() {
    navigator.clipboard.writeText(whatsappDraft);
  }

  const vibeFitColors: Record<string, string> = {
    likely: "bg-olive text-white",
    maybe: "bg-sand text-ink",
    unlikely: "bg-[#6b7280] text-white",
  };

  const aiButtonClass =
    "touch-target inline-flex w-full items-center justify-center rounded-lg px-4 text-sm font-medium disabled:opacity-60 sm:w-auto";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-ink">{lead.name}</h1>
          <p className="mt-2 text-sand">{lead.email}</p>
          <p className="text-sand">{formatPhone(lead.phone)}</p>
        </div>

        {trip && (
          <div>
            <p className="font-semibold text-rust">{trip.name}</p>
            <p className="text-sm text-ink/70">
              {formatDateRange(trip.start_date, trip.end_date)}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {lead.group_type && (
            <span className="rounded-full bg-admin px-3 py-1 text-sm capitalize text-ink">
              {lead.group_type}
            </span>
          )}
          {lead.preferred_month && (
            <span className="rounded-full bg-admin px-3 py-1 text-sm text-ink">
              {lead.preferred_month}
            </span>
          )}
        </div>

        {lead.vibe_note && (
          <blockquote className="border-l-4 border-rust bg-sand/30 px-4 py-3 italic text-ink/80">
            {lead.vibe_note}
          </blockquote>
        )}

        <p className="text-sm text-sand">
          Received on {formatDate(lead.created_at)}
        </p>
      </div>

      <div className="space-y-8">
        <div className="admin-card">
          <h2 className="mb-4 font-semibold text-ink">Pipeline</h2>
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <div className="flex flex-nowrap gap-2">
              {LEAD_STATUSES.map((status, index) => {
                const isCurrent = status === lead.status;
                const isCompleted = index < currentIndex;

                return (
                  <button
                    key={status}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange(status)}
                    className={cn(
                      "touch-target shrink-0 rounded-full px-3 text-xs font-medium transition-opacity disabled:opacity-50",
                      isCurrent && "bg-rust text-white",
                      isCompleted && !isCurrent && "bg-olive text-white",
                      !isCurrent && !isCompleted && "bg-sand text-ink"
                    )}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
          {statusError && (
            <p className="mt-3 text-sm text-rust" role="alert">
              {statusError}
            </p>
          )}
        </div>

        <div className="admin-card">
          <h2 className="mb-4 font-semibold text-ink">Owner</h2>
          <select
            value={lead.owner_id || ""}
            onChange={(e) => handleOwnerChange(e.target.value)}
            disabled={isPending}
            className="touch-target w-full rounded-lg border border-sand/50 bg-white px-3 text-sm text-ink outline-none"
          >
            <option value="">Unassigned</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name || p.email}
              </option>
            ))}
          </select>
          {ownerError && (
            <p className="mt-2 text-sm text-rust" role="alert">
              {ownerError}
            </p>
          )}
        </div>

        <div className="admin-card space-y-4">
          <h2 className="font-semibold text-ink">AI tools</h2>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleWhatsAppDraft}
              disabled={whatsappLoading}
              className={cn(aiButtonClass, "bg-rust text-white")}
            >
              {whatsappLoading ? "Thinking..." : "Draft WhatsApp message"}
            </button>
            {whatsappError && (
              <p className="text-sm text-rust">{whatsappError}</p>
            )}
            {whatsappDraft && (
              <div>
                <textarea
                  value={whatsappDraft}
                  onChange={(e) => setWhatsappDraft(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-sand/50 bg-white px-3 py-2 text-sm text-ink"
                />
                <button
                  type="button"
                  onClick={copyDraft}
                  className="touch-target mt-2 text-sm text-rust hover:underline"
                >
                  Copy
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {callLogs.length === 0 ? (
              <p className="text-sm italic text-sand/80">
                Add notes first to generate a summary.
              </p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCallSummary}
                  disabled={summaryLoading}
                  className={cn(
                    aiButtonClass,
                    "border border-sand/50 bg-white text-ink"
                  )}
                >
                  {summaryLoading ? "Thinking..." : "Summarise call log"}
                </button>
                {summaryError && (
                  <p className="text-sm text-rust">{summaryError}</p>
                )}
                {callSummary && (
                  <div className="rounded-lg bg-sand/30 p-4 text-sm text-ink">
                    {callSummary}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleVibeFit}
              disabled={vibeLoading}
              className={cn(
                aiButtonClass,
                "border border-sand/50 bg-white text-ink"
              )}
            >
              {vibeLoading ? "Thinking..." : "Read the vibe"}
            </button>
            {vibeError && <p className="text-sm text-rust">{vibeError}</p>}
            {vibeFit && (
              <div>
                <span
                  className={cn(
                    "inline-block rounded-full px-3 py-1 text-xs font-medium capitalize",
                    vibeFitColors[vibeFit.fit] || vibeFitColors.maybe
                  )}
                >
                  {vibeFit.fit}
                </span>
                <p className="mt-2 text-sm text-ink">{vibeFit.reason}</p>
                <p className="mt-1 text-xs text-olive/60">
                  This is a suggestion. Your call.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="mb-4 font-semibold text-ink">Call log</h2>

          {callLogs.length === 0 ? (
            <p className="mb-4 text-sm italic text-sand">
              No notes yet. Add the first one below.
            </p>
          ) : (
            <ul className="mb-6 space-y-4">
              {callLogs.map((log) => (
                <li
                  key={log.id}
                  className="border-b border-sand/30 pb-4 last:border-0"
                >
                  <p className="text-sm text-ink">{log.note}</p>
                  {log.next_action && (
                    <p className="mt-1 text-sm italic text-sand">
                      Next: {log.next_action}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-sand">
                    Added by {log.creator?.full_name || "Unknown"} on{" "}
                    {formatDate(log.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What happened and what was said"
              rows={3}
              required
              className="w-full rounded-lg border border-sand/50 bg-white px-3 py-2 text-sm text-ink"
            />
            <input
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Next action"
              className="touch-target w-full rounded-lg border border-sand/50 bg-white px-3 text-sm text-ink"
            />
            {logError && (
              <p className="text-sm text-rust" role="alert">
                {logError}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending || addingNote}
              className="touch-target rounded-lg bg-rust px-4 text-sm font-medium text-white disabled:opacity-60"
            >
              {addingNote || isPending ? "Adding..." : "Add note"}
            </button>
          </form>
        </div>

        <div className="admin-card">
          <h2 className="mb-4 font-semibold text-ink">Activity</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-olive/60">No activity recorded yet.</p>
          ) : (
            <ol className="relative space-y-6 border-l border-sand/40 pl-6">
              {activities.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-rust" />
                  <p className="text-sm font-medium text-ink">{entry.action}</p>
                  {entry.detail && (
                    <p className="text-sm text-ink/70">{entry.detail}</p>
                  )}
                  <p className="mt-1 text-xs text-sand">
                    {entry.performer?.full_name || "System"} ·{" "}
                    {formatDate(entry.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
