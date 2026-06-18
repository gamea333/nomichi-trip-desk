import type { GroupType, LeadStatus } from "./constants";

export interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  price_incl_gst: number;
  total_seats: number;
  seats_left: number;
  status: "open" | "closed";
  description: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "admin" | "associate";
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  trip_id: string | null;
  group_type: GroupType | null;
  preferred_month: string | null;
  vibe_note: string | null;
  status: LeadStatus;
  owner_id: string | null;
  created_at: string;
}

export interface CallLog {
  id: string;
  lead_id: string;
  note: string;
  next_action: string | null;
  created_by: string | null;
  created_at: string;
  creator?: { full_name: string | null } | null;
}

export interface ActivityEntry {
  id: string;
  lead_id: string;
  action: string;
  detail: string | null;
  performed_by: string | null;
  created_at: string;
  performer?: { full_name: string | null } | null;
}
