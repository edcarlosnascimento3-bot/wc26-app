import { supabaseServer } from "@/lib/supabase/server";

const phaseLabels: Record<string, string> = {
  group: "Fase de Grupos",
  r32: "32 Ávos",
  r16: "Oitavas",
  qf: "Quartas",
  sf: "Semifinal",
  final: "Final",
};

export default async function PalpiteFasePage({
  params,
}: {
  params: Promise<{ fase: string }>;
}) {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { fase } = await params;
  const label = phaseLabels[fase] ?? fase;

  if (fase === "group") {
    const { PalpitePanel } = await import("@/components/PalpitePanel");
    const GROUPS = "ABCDEFGHIJKL".split("");

    const [teamsR, matchesR, predsR, venuesR] = await Promise.all([
      supabase.from("teams").select("*"),
      supabase.from("matches").select("*").eq("phase", "group").order("kickoff_utc"),
      supabase.from("predictions").select("*").eq("user_id", auth.user.id),
      supabase.from("venues").select("id,name,city"),
    ]);

    const teamsMap = new Map((teamsR.data ?? []).map(t => [t.id, { name: t.name, flag_url: t.flag_url }]));
    const predMap = new Map((predsR.data ?? []).map(p => [p.match_id, p]));
    const venuesMap: Record<string, { name: string; city: string }> = {};
    for (const v of venuesR.data ?? []) venuesMap[v.id] = { name: v.name, city: v.city };

    const matchesByGroup = new Map<string, any[]>();
    for (const g of GROUPS) matchesByGroup.set(g, []);
    for (const m of matchesR.data ?? []) {
      if (m.group_code) matchesByGroup.get(m.group_code)?.push(m);
    }

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Palpites — {label}</h1>
        <p className="text-sm">Você pode dar seu palpite até o contador atingir 30 minutos antes da partida</p>
        <div className="grid md:grid-cols-3 gap-6">
          {GROUPS.map(g => {
            const groupMatches = matchesByGroup.get(g) ?? [];
            return (
              <PalpitePanel
                key={g} groupCode={g} matches={groupMatches}
                predictionsMap={predMap} teamsMap={teamsMap}
                venuesMap={venuesMap}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Bracket phases
  const [teamsR, matchesR, bracketR, predsR, venuesR] = await Promise.all([
    supabase.from("teams").select("*"),
    supabase.from("matches").select("*"),
    supabase.from("bracket_slots").select("*"),
    supabase.from("predictions").select("*").eq("user_id", auth.user.id),
    supabase.from("venues").select("id,name,city"),
  ]);

  const teamsMap = new Map((teamsR.data ?? []).map(t => [t.id, { name: t.name, flag_url: t.flag_url }]));
  const predMap = new Map((predsR.data ?? []).map(p => [p.match_id, p]));
  const venuesMap: Record<string, { name: string; city: string }> = {};
  for (const v of venuesR.data ?? []) venuesMap[v.id] = { name: v.name, city: v.city };
  const phaseMatches = (bracketR.data ?? []).filter(s => (s.round ?? s.slot?.split("_")[0]) === fase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Palpites — {label}</h1>
      <p className="text-sm">Seus palpites para {label.toLowerCase()}</p>
      {phaseMatches.length === 0 && (
        <p className="text-sm opacity-50 italic">Nenhuma partida disponível para esta fase.</p>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {phaseMatches.map(s => {
          const matchId = (s.meta as any)?.match_id;
          const match = matchId ? (matchesR.data ?? []).find(m => m.id === matchId) : null;
          if (!match) return null;
          const home = teamsMap.get(match.home_team_id);
          const away = teamsMap.get(match.away_team_id);
          const pred = predMap.get(match.id);
          const venueId = match.venue_id ?? match.venueId ?? (s as any).venue_id_override;
          const venue = venueId ? venuesMap[venueId] : null;
          return (
            <div key={s.id} className="rounded-xl border p-4 bg-white space-y-2">
              {venue && <div className="text-xs opacity-60 truncate">{venue.name}, {venue.city}</div>}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  {home?.flag_url && <img src={home.flag_url} alt="" className="w-6 h-4 object-cover rounded" />}
                  <span className="text-sm font-medium truncate">{home?.name ?? match.home_team_id}</span>
                </div>
                <span className="text-xs opacity-50">vs</span>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-sm font-medium truncate">{away?.name ?? match.away_team_id}</span>
                  {away?.flag_url && <img src={away.flag_url} alt="" className="w-6 h-4 object-cover rounded" />}
                </div>
              </div>
              {pred ? (
                <div className="text-center text-sm font-bold">
                  Seu palpite: {pred.pred_home} x {pred.pred_away}
                </div>
              ) : (
                <div className="text-center text-xs opacity-40 italic">Sem palpite ainda</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
