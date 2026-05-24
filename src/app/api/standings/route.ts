import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { computeGroupStandings } from "@/lib/wc/standings";

export async function GET() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [teamsR, matchesR] = await Promise.all([
    supabase.from("teams").select("id,group_code,name,flag_url"),
    supabase.from("matches").select("id,group_code,home_team_id,away_team_id,real_home,real_away").eq("phase", "group"),
  ]);

  const teamsMap = new Map((teamsR.data ?? []).map(t => [t.id, { name: t.name, flag_url: t.flag_url }]));

  const merged = (matchesR.data ?? []).map(m => ({
    group_code: m.group_code,
    home_team_id: m.home_team_id,
    away_team_id: m.away_team_id,
    h: m.real_home ?? null,
    a: m.real_away ?? null,
  }));

  const groups = "ABCDEFGHIJKL".split("");
  const out: Record<string, any[]> = {};
  for (const g of groups) {
    const teamsInGroup = (teamsR.data ?? []).filter(t => t.group_code === g).map(t => t.id);
    const standings = computeGroupStandings(g, merged, teamsInGroup);
    out[g] = standings.map(s => ({
      ...s,
      teamName: teamsMap.get(s.teamId)?.name ?? s.teamId,
      flagUrl: teamsMap.get(s.teamId)?.flag_url ?? null,
    }));
  }

  return NextResponse.json(out);
}
