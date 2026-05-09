"use server";

import { createClient } from "@/utils/supabase/server";

export async function getChatSessions() {
  const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) return [];

  try {
    const res = await fetch(`${fastApiUrl}/api/chat/sessions`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export async function getChatMessages(sessionId: string) {
  const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) return [];

  try {
    const res = await fetch(`${fastApiUrl}/api/chat/sessions/${sessionId}/messages`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}
