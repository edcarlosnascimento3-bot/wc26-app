import { supabaseServer } from "@/lib/supabase/server";
import { PalpitePanel } from "@/components/PalpitePanel";

const GROUPS = "ABCDEFGHIJKL".split("");

export default async function PalpitePage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [teamsR, matchesR, predsR] = await Promise.all([
    supabase.from("teams").select("*"),
    supabase.from("matches").select("*").eq("phase", "group").order("kickoff_utc"),
    supabase.from("predictions").select("*").eq("user_id", auth.user.id),
  ]);

  const teamsMap = new Map((teamsR.data ?? []).map(t => [t.id, { name: t.name, flag_url: t.flag_url }]));
  const predMap = new Map((predsR.data ?? []).map(p => [p.match_id, p]));

  const matchesByGroup = new Map<string, any[]>();
  for (const g of GROUPS) matchesByGroup.set(g, []);
  for (const m of matchesR.data ?? []) {
    if (m.group_code) matchesByGroup.get(m.group_code)?.push(m);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Palpites — Fase de Grupos</h1>
      <p className="text-sm">Você pode dar seu palpite até o contador atingir 30 minutos antes da partida</p>
        <div className="grid md:grid-cols-3 gap-6">
        {GROUPS.map(g => {
          const groupMatches = matchesByGroup.get(g) ?? [];
          return (
            <PalpitePanel
              key={g} groupCode={g} matches={groupMatches}
              predictionsMap={predMap} teamsMap={teamsMap}
            />
          );
        })}
      </div>
    </div>
  );
}
