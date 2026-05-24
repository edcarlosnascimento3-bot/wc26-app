import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

export default async function EstadiosPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [venuesR, matchesR, teamsR] = await Promise.all([
    supabase.from("venues").select("*").order("name"),
    supabase.from("matches").select("*").order("kickoff_utc"),
    supabase.from("teams").select("*"),
  ]);

  const teamsMap = new Map((teamsR.data ?? []).map(t => [t.id, { name: t.name, flag_url: t.flag_url }]));
  const matchesByVenue = new Map<string, any[]>();
  for (const m of matchesR.data ?? []) {
    if (!matchesByVenue.has(m.venue_id)) matchesByVenue.set(m.venue_id, []);
    matchesByVenue.get(m.venue_id)!.push(m);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Estádios</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(venuesR.data ?? []).length === 0 && (
          <p className="text-sm opacity-50 italic col-span-full">Nenhum estádio encontrado.</p>
        )}
        {(venuesR.data ?? []).map(v => {
          const venueMatches = matchesByVenue.get(v.id) ?? [];
          const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
          return (
            <div key={v.id} className="rounded-xl border overflow-hidden bg-white">
              {v.photo_url ? (
                <img src={v.photo_url} alt={v.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">🏟️ Sem foto</div>
              )}
              <div className="p-3 space-y-2">
                <h3 className="font-semibold">{v.name}</h3>
                <p className="text-xs opacity-70">{v.city}{v.country ? `, ${v.country}` : ""} &middot; {v.capacity?.toLocaleString()} lugares</p>
                {venueMatches.length > 0 && (
                  <div className="pt-1 space-y-1 border-t">
                    <p className="text-xs font-medium opacity-60">Confrontos:</p>
                    {venueMatches.slice(0, 4).map(m => {
                      const home = teamsMap.get(m.home_team_id);
                      const away = teamsMap.get(m.away_team_id);
                      return (
                        <div key={m.id} className="flex items-center gap-1 text-xs">
                          {home?.flag_url && <img src={home.flag_url} alt="" className="w-4 h-3 object-cover rounded" />}
                          <span className="truncate">{home?.name ?? m.home_team_id}</span>
                          <span className="opacity-50 mx-0.5">vs</span>
                          {away?.flag_url && <img src={away.flag_url} alt="" className="w-4 h-3 object-cover rounded" />}
                          <span className="truncate">{away?.name ?? m.away_team_id}</span>
                          <span className="ml-auto opacity-40">{fmtDate(m.kickoff_utc)}</span>
                        </div>
                      );
                    })}
                    {venueMatches.length > 4 && <p className="text-xs opacity-40">+{venueMatches.length - 4} jogos</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
