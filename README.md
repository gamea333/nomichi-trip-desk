# Nomichi Trip Desk

A lead management and trip CRM for the Nomichi team.

## Live App

[URL here] — Admin login: [email] / [password]

## What this is

Nomichi Trip Desk is the internal tool behind Nomichi's curated travel experiences. The public site lets travellers browse open trips and submit enquiries; the admin desk gives the team a single place to manage leads, track pipeline status, log calls, and draft outreach with AI assistance.

## Running locally

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your Supabase and Groq keys
3. Run `supabase/schema.sql` then `supabase/seed.sql` in your Supabase SQL editor
4. `npm install && npm run dev`

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`

## Schema decisions

The database uses five tables plus Supabase Auth:

- **profiles** — one row per team member, created automatically when someone signs up
- **trips** — catalogue of journeys with seats, pricing, and open/closed status
- **leads** — enquiries from the public form or future channels
- **call_logs** — structured notes from phone conversations, separate from the audit trail
- **activity_timeline** — append-only log of system events (status changes, assignments, notes)

`call_logs` and `activity_timeline` are split on purpose. Call logs hold the raw conversation record the team reads day to day. The timeline is a lightweight audit trail that auto-populates from mutations so you can see what changed and when without parsing note text.

RLS is enabled on sensitive tables. Open trips are readable by anonymous users for the public page. Authenticated team members can read all leads and write call logs. Public enquiry submissions use the service role server-side so visitors never need an account. Admin mutations that must not fail silently (status updates, owner assignment) also use the service role after verifying the session.

## AI features

Three AI tools live on the lead detail page. All run server-side via `/api/ai/*` routes using Groq (Llama 3.3 70B) and never expose the API key to the browser.

1. **Draft WhatsApp message** — generates a warm first message referencing the trip and vibe note
2. **Summarise call log** — condenses all call notes into two plain-text sentences
3. **Read the vibe** — suggests likely/maybe/unlikely fit based on enquiry answers, always framed as a suggestion

Keeping AI on the server protects the API key, keeps prompts consistent, and allows auth checks before any model call.

## Decisions made

- **Service role for public lead inserts and admin status updates** — RLS is great for reads, but CRM writes need to be reliable. Using the service role after session verification avoids silent zero-row updates.
- **Separate activity timeline from call logs** — notes are for humans; timeline entries are for accountability. Splitting them keeps the UI clear and the audit trail automatic.
- **Server Components for lists, client components only where interaction is needed** — leads and trips fetch on the server for speed and SEO; filters, forms, and AI panels hydrate only where necessary.

## What you would build next

- WhatsApp webhook to auto-create leads when someone messages the Nomichi number
- CSV export filtered by date range
- Email notification to owner when a lead is assigned to them
- Role-based access: associates see only their own leads (RLS fully enforced)
- Reminders: flag leads with no activity in 48 hours

## Deploy checklist

Before submitting, verify:

- [ ] `npm run build` exits with zero errors
- [ ] All env vars added to Vercel dashboard
- [ ] `supabase/schema.sql` and `seed.sql` run clean on production Supabase project
- [ ] Live Vercel URL loads public page with trips visible
- [ ] Admin login works on live URL
- [ ] Enquiry form submits successfully on mobile (test on phone)
- [ ] CSV export downloads correctly
- [ ] All three AI features work on the live URL
- [ ] No `.env` files committed to the repo
- [ ] `.env.example` is committed and complete
