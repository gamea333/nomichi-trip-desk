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
    const { vibe_note, group_type, preferred_month } = await request.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are helping a slow travel company assess if a traveller is a good fit. Based on their enquiry answers, respond with JSON only: { fit: 'likely' | 'maybe' | 'unlikely', reason: string (one sentence, specific, no judgment words) }. This is a suggestion only, never a reject. Be honest and warm.",
        },
        {
          role: "user",
          content: JSON.stringify({ vibe_note, group_type, preferred_month }),
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content ?? "{}";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Vibe fit error:", err);
    return NextResponse.json({ error: "Failed to assess vibe fit" }, { status: 500 });
  }
}
