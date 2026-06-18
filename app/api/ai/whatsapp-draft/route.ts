import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Groq key exists:", !!process.env.GROQ_API_KEY);

  try {
    const { lead, trip } = await request.json();
    const firstName = (lead.name as string).split(" ")[0];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You write the first WhatsApp message from the Nomichi team to a traveller. Nomichi is a warm, slow travel community brand. Rules: second person, under 60 words, short sentences, warm and specific, reference the trip name and something from their vibe note if present, no exclamation marks, no em-dashes, no words like unlock/elevate/embark/journey. Start with Hi [first name only].",
        },
        {
          role: "user",
          content: `Lead: ${JSON.stringify({ firstName, vibe_note: lead.vibe_note, group_type: lead.group_type })}\nTrip: ${JSON.stringify({ name: trip.name, destination: trip.destination })}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const draft = completion.choices[0].message.content ?? "";

    return NextResponse.json({ draft });
  } catch (err) {
    console.error("WhatsApp draft error:", err);
    return NextResponse.json({ error: "Failed to generate draft" }, { status: 500 });
  }
}
