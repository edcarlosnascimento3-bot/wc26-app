import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { buildBracket } from "@/lib/wc/bracket";
import { computeGroupStandings } from "@/lib/wc/standings";

const phaseLabels: Record<string, string> = {
  group: "Fase de Grupos",
  r32: "32 Ávos",
  r16: "Oitavas",
  qf: "Quartas",
  sf: "Semifinal",
  "3p": "Disputa do 3º Lugar",
  final: "Final",
};

const roundOrder = ["r32", "r16", "qf", "sf", "3p", "final"];

export async function GET(request: NextRequest) {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const faseParam = request.nextUrl.searchParams.get("fase");

  const [matchesR, slotsR, teamsR, venuesR, predsR, scorersR] = await Promise.all([
    supabase.from("matches").select("*").order("kickoff_utc"),
    supabase.from("bracket_slots").select("*"),
    supabase.from("teams").select("id,name,flag_url,group_code"),
    supabase.from("venues").select("id,name,city"),
    supabase.from("predictions").select("match_id,pred_home,pred_away").eq("user_id", auth.user.id),
    supabase.from("goalscorers").select("match_id, player_id, team_id, goals, players!inner(name)"),
  ]);

  const matches = matchesR.data ?? [];
  const slots = slotsR.data ?? [];
  const teams = teamsR.data ?? [];
  const venues = venuesR.data ?? [];
  const predMap = new Map((predsR.data ?? []).map(p => [p.match_id, p]));

  const venuesMap: Record<string, { name: string; city: string }> = {};
  for (const v of venues) {
    venuesMap[v.id] = { name: v.name, city: v.city };
  }

  const scorersByMatch: Record<string, { player: string; team_id: string; goals: number }[]> = {};
  for (const s of scorersR.data ?? []) {
    const pid = s.match_id as string;
    if (!pid) continue;
    if (!scorersByMatch[pid]) scorersByMatch[pid] = [];
    const pName = Array.isArray(s.players) ? s.players[0]?.name : (s.players as any)?.name;
    if (pName) scorersByMatch[pid].push({ player: pName, team_id: s.team_id, goals: s.goals });
  }

  const teamsMap: Record<string, { name: string; flag_url: string | null }> = {};
  for (const t of teams) {
    teamsMap[t.id] = { name: t.name, flag_url: t.flag_url };
  }

  const groups = "ABCDEFGHIJKL".split("");
  const teamsByGroup = new Map<string, string[]>();
  for (const g of groups) teamsByGroup.set(g, []);
  for (const t of teams) {
    if (t.group_code) teamsByGroup.get(t.group_code)?.push(t.id);
  }

  const groupMatches = matches.filter(m => m.phase === "group");
  const groupDone = groupMatches.length > 0 && groupMatches.every(m => m.real_home != null && m.real_away != null);

  const groupMatchesMerged = groupMatches.map(m => ({
    group_code: m.group_code,
    home_team_id: m.home_team_id,
    away_team_id: m.away_team_id,
    h: m.real_home,
    a: m.real_away,
  }));

  const standingsByGroup: Record<string, any[]> = {};
  for (const g of groups) {
    const teamsInGroup = teamsByGroup.get(g) ?? [];
    standingsByGroup[g] = computeGroupStandings(g, groupMatchesMerged, teamsInGroup);
  }

  const scoreBySlot: Record<string, { home: number | null; away: number | null }> = {};
  for (const s of slots) {
    const matchId = (s.meta?.match_id as string | undefined) ?? null;
    const m = matchId ? matches.find(x => x.id === matchId) : null;
    if (m) {
      scoreBySlot[s.slot] = { home: m.real_home ?? null, away: m.real_away ?? null };
    } else {
      scoreBySlot[s.slot] = { home: null, away: null };
    }
  }

  const overrides: Record<string, { kickoffUTC?: string | null; venueId?: string | null }> = {};
  for (const s of slots) {
    overrides[s.slot] = {
      kickoffUTC: s.kickoff_utc_override ?? null,
      venueId: s.venue_id_override ?? null,
    };
  }

  // If ?fase= param is provided, return that specific phase regardless of groupDone
  if (faseParam) {
    if (faseParam === "group") {
      return NextResponse.json({
        phase: "group",
        label: phaseLabels.group,
        matches: groupMatches,
        teamsMap,
        venuesMap,
        groupDone,
        scorersByMatch,
      });
    }
    const bracket = buildBracket(slots, standingsByGroup as any, scoreBySlot, overrides);
    const faseMatches = bracket.filter(m => m.round === faseParam);
    const matchIdToReal = new Map(matches.map(m => [m.id, { real_home: m.real_home, real_away: m.real_away }]));
    const faseMatchesWithReal = faseMatches.map(m => {
      const real = matchIdToReal.get(m.slot);
      return { ...m, real_home: real?.real_home ?? null, real_away: real?.real_away ?? null };
    });
    return NextResponse.json({
      phase: faseParam,
      label: phaseLabels[faseParam] ?? faseParam,
      matches: faseMatchesWithReal,
      teamsMap,
      venuesMap,
      groupDone,
      scorersByMatch,
    });
  }

  if (!groupDone) {
    return NextResponse.json({
      phase: "group",
      label: phaseLabels.group,
      matches: groupMatches,
      teamsMap,
      venuesMap,
      groupDone: false,
      scorersByMatch,
    });
  }

  const bracket = buildBracket(slots, standingsByGroup as any, scoreBySlot, overrides);

  let currentPhase = "r32";
  for (const r of roundOrder) {
    const phaseMatches = bracket.filter(m => m.round === r);
    if (phaseMatches.length === 0) continue;
    const allDone = phaseMatches.every(m => m.homeScore != null && m.awayScore != null);
    if (!allDone) {
      currentPhase = r;
      break;
    }
    currentPhase = r;
  }

  const phaseMatches = bracket.filter(m => m.round === currentPhase);

  const matchIdToReal = new Map(matches.map(m => [m.id, { real_home: m.real_home, real_away: m.real_away }]));
  const phaseMatchesWithReal = phaseMatches.map(m => {
    const real = matchIdToReal.get(m.slot);
    return {
      ...m,
      real_home: real?.real_home ?? null,
      real_away: real?.real_away ?? null,
    };
  });

  return NextResponse.json({
    phase: currentPhase,
    label: phaseLabels[currentPhase] ?? currentPhase,
    matches: phaseMatchesWithReal,
    teamsMap,
    venuesMap,
    groupDone: true,
    scorersByMatch,
  });
}
