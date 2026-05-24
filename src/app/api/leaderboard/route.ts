import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { scorePrediction } from "@/lib/wc/scoring";

export async function GET() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [matchesR, predsR, profR] = await Promise.all([
    supabase.from("matches").select("id,real_home,real_away"),
    supabase.from("predictions").select("user_id,match_id,pred_home,pred_away"),
    supabase.from("profiles").select("id,display_name,avatar_url")
  ]);

  const matchMap = new Map((matchesR.data ?? []).map(m => [m.id, m]));
  const users = new Map((profR.data ?? []).map(p => [p.id, p]));

  const pointsByUser = new Map<string, number>();
  for (const p of (predsR.data ?? [])) {
    const m = matchMap.get(p.match_id);
    const pts = scorePrediction(m?.real_home ?? null, m?.real_away ?? null, p.pred_home ?? null, p.pred_away ?? null);
    pointsByUser.set(p.user_id, (pointsByUser.get(p.user_id) ?? 0) + pts);
  }

  const leaderboard = [...pointsByUser.entries()]
    .map(([userId, points]) => ({ userId, points, profile: users.get(userId) }))
    .sort((a,b) => b.points - a.points);

  return NextResponse.json({ leaderboard });
}
