import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ unread: 0 });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("last_chat_at")
    .eq("id", auth.user.id)
    .single();

  const since = profile?.last_chat_at ?? new Date(0).toISOString();

  const { count } = await supabaseAdmin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .gt("created_at", since)
    .neq("user_id", auth.user.id);

  return NextResponse.json({ unread: count ?? 0 });
}
