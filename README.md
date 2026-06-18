Nomichi Trip Desk

A lead management and trip CRM built for the Nomichi team.

Live App

URL: https://nomichi-trip-desk-mu.vercel.app/
Admin login: abelweeknd888@gmail.com / adityasinghmehra

What this is

Nomichi Trip Desk is the internal tool behind Nomichi's curated travel experiences. The public site lets travellers browse open trips and submit enquiries. The admin desk gives the team a single place to manage leads, track pipeline status, log calls, and draft outreach with AI assistance — replacing the Google Sheets workflow described in the brief.

Running locally


Clone the repo


bash   git clone https://github.com/gamea333/nomichi-trip-desk.git
   cd nomichi-trip-desk


Install dependencies


bash   npm install


Copy .env.example to .env.local and fill in your Supabase and Groq keys


bash   cp .env.example .env.local


Run supabase/schema.sql then supabase/seed.sql in your Supabase SQL editor, in that order
Create an admin user in Supabase under Authentication → Users
Start the dev server


bash   npm run dev


Visit localhost:3000 for the public page and localhost:3000/admin/login for team access


Required environment variables

VariableWhere to find itNEXT_PUBLIC_SUPABASE_URLSupabase → Settings → APINEXT_PUBLIC_SUPABASE_ANON_KEYSupabase → Settings → API (Publishable key)SUPABASE_SERVICE_ROLE_KEYSupabase → Settings → API (Secret key)GROQ_API_KEYconsole.groq.com → API Keys

Schema decisions

The database uses five tables plus Supabase Auth:


profiles — one row per team member, created automatically on signup via a Postgres trigger
trips — catalogue of journeys with seats, pricing, and open/closed status
leads — enquiries from the public form, with pipeline status and owner assignment
call_logs — structured notes from phone conversations, the team's day-to-day record
activity_timeline — append-only log of system events (status changes, assignments, notes added)


call_logs and activity_timeline are split on purpose. Call logs hold the raw conversation record the team reads to understand a lead. The timeline is a lightweight audit trail that auto-populates from mutations, so anyone can see what changed and when without parsing note text.

Row Level Security is enabled on all sensitive tables:


Open trips are readable by anonymous users, so the public page works without auth
Authenticated team members can read all leads and insert call logs
Public enquiry submissions use the service role server-side, since visitors never create an account
Admin mutations that must not fail silently (status updates, owner assignment) also use the service role after verifying the session, to avoid RLS silently blocking a write the team expects to succeed


AI features

Three AI tools live on the lead detail page. All run server-side via /api/ai/* route handlers using Groq (Llama 3.3 70B), and the API key is never exposed to the browser.


Draft WhatsApp message — generates a warm first message in Nomichi's voice, referencing the trip and the traveller's vibe note
Summarise call log — condenses all call notes into two plain-text sentences: where the lead stands, and the next action
Read the vibe — suggests likely / maybe / unlikely fit based on enquiry answers, with a one-line reason. Always framed as a suggestion, never an automatic decision


Keeping AI calls on the server protects the API key, keeps prompts consistent across the team, and allows an auth check before any model call runs.

Decisions I'm most proud of


Service role for public lead inserts and admin status updates. RLS is great for reads, but CRM writes need to be reliable every time. Using the service role after verifying the session avoids silent zero-row updates that would otherwise be confusing to debug.
Separating the activity timeline from call logs. Notes are for humans to read and understand context. Timeline entries are for accountability and happen automatically. Splitting them keeps the call log clean and the audit trail complete without any extra effort from the team.
Server Components for lists, client components only where interaction is needed. Leads and trips fetch on the server for speed. Filters, forms, and the AI panels hydrate only where they need to, keeping the app fast on a slow mobile connection, which matters since sales associates are often on the move.


What I would build with another week


A WhatsApp webhook to auto-create leads when someone messages the Nomichi number directly, removing the manual copy-paste step entirely
CSV export filtered by date range, not just a full dump
Email or push notification to an owner the moment a lead is assigned to them
Fully enforced role-based access, so associates see only their own leads while admins see everything
A simple reminder system that flags any lead with no activity in 48 hours, so nothing falls through the cracks


Deploy checklist


 npm run build exits with zero errors
 All env vars added to Vercel dashboard
 supabase/schema.sql and seed.sql run clean on production Supabase project
 Live Vercel URL loads public page with trips visible
 Admin login works on live URL
 Enquiry form submits successfully on mobile
 CSV export downloads correctly
 All three AI features work on the live URL
 No .env files committed to the repo
 .env.example is committed and complete

ShareContentpdf-- Nomichi Trip Desk schema

-- profiles
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text,
  role text check (role in ('admin','associate')) default 'associate',
  created_at timestamptz default now()
);

-- trips
create table trips (
 pasted
