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
    const { notes } = await request.json();

    if (!notes || notes.length === 0) {
      return NextResponse.json(
        { error: "No call notes to summarise" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are summarising a sales call log for a travel company. Read all the notes and respond with exactly two sentences: first sentence is where this lead stands right now, second sentence is the single most important next action. No bullet points. No headers. Plain text only.",
        },
        {
          role: "user",
          content: `Call log notes:\n${(notes as string[]).join("\n---\n")}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content ?? "";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Call summary error:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
