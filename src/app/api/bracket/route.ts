import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { buildBracket } from "@/lib/wc/bracket";
import { computeGroupStandings } from "@/lib/wc/standings";

export async function GET() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [slotsR, teamsR, matchesR, predsR, venuesR] = await Promise.all([
    supabase.from("bracket_slots").select("*"),
    supabase.from("teams").select("id,name,flag_url,group_code"),
    supabase.from("matches").select("id,phase,group_code,home_team_id,away_team_id,real_home,real_away,kickoff_utc,venue_id"),
    supabase.from("predictions").select("match_id,pred_home,pred_away").eq("user_id", auth.user.id),
    supabase.from("venues").select("id,name,city"),
  ]);

  const slots = slotsR.data ?? [];
  const matches = matchesR.data ?? [];
  const predMap = new Map((predsR.data ?? []).map(p => [p.match_id, p]));

  const groups = "ABCDEFGHIJKL".split("");
  const standingsByGroup: Record<string, any[]> = {};

  const teamsByGroup = new Map<string, string[]>();
  for (const g of groups) teamsByGroup.set(g, []);
  for (const t of (teamsR.data ?? [])) {
    if (t.group_code) teamsByGroup.get(t.group_code)?.push(t.id);
  }

  const hasRealResults = matches.some(m => m.phase === "group" && m.real_home != null && m.real_away != null);

  if (hasRealResults) {
    const groupMatchesMerged = matches
      .filter(m => m.phase === "group" && m.group_code)
      .map(m => ({
        group_code: m.group_code,
        home_team_id: m.home_team_id,
        away_team_id: m.away_team_id,
        h: m.real_home ?? null,
        a: m.real_away ?? null,
      }));

    for (const g of groups) {
      const teamsInGroup = teamsByGroup.get(g) ?? [];
      standingsByGroup[g] = computeGroupStandings(g, groupMatchesMerged, teamsInGroup);
    }
  }

  const scoreBySlot: Record<string, { home: number|null; away: number|null }> = {};

  for (const s of slots) {
    const matchId = (s.meta?.match_id as string | undefined) ?? null;
    const m = matchId ? matches.find(x => x.id === matchId) : null;

    if (m) {
      const p = predMap.get(m.id);
      scoreBySlot[s.slot] = {
        home: (p?.pred_home ?? m.real_home ?? null),
        away: (p?.pred_away ?? m.real_away ?? null)
      };
    } else {
      scoreBySlot[s.slot] = { home: null, away: null };
    }
  }

  const overrides: Record<string, { kickoffUTC?: string|null; venueId?: string|null }> = {};
  for (const s of slots) {
    overrides[s.slot] = {
      kickoffUTC: s.kickoff_utc_override ?? null,
      venueId: s.venue_id_override ?? null
    };
  }

  const bracket = buildBracket(slots, standingsByGroup as any, scoreBySlot, overrides);

  const teamsMap: Record<string, { name: string; flag_url: string | null }> = {};
  for (const t of (teamsR.data ?? [])) {
    teamsMap[t.id] = { name: t.name, flag_url: t.flag_url };
  }

  const venuesMap: Record<string, { name: string; city: string }> = {};
  for (const v of venuesR.data ?? []) {
    venuesMap[v.id] = { name: v.name, city: v.city };
  }

  return NextResponse.json({ bracket, teamsMap, venuesMap });
}
