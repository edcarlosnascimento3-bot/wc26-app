import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("champion_picks")
    .select("team_id")
    .eq("user_id", auth.user.id);

  return NextResponse.json({ picks: (data ?? []).map(p => p.team_id) });
}

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { picks } = await req.json();
  if (!Array.isArray(picks) || picks.length > 3) {
    return NextResponse.json({ error: "invalid picks" }, { status: 400 });
  }

  await supabase.from("champion_picks").delete().eq("user_id", auth.user.id);

  if (picks.length > 0) {
    const rows = picks.map((team_id: string) => ({ user_id: auth.user.id, team_id }));
    const { error } = await supabase.from("champion_picks").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
