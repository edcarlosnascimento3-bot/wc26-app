import { supabaseServer } from "@/lib/supabase/server";
import { GroupPanel } from "@/components/GroupPanel";

const GROUPS = "ABCDEFGHIJKL".split("");

export default async function GruposPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [teamsR, matchesR] = await Promise.all([
    supabase.from("teams").select("*"),
    supabase.from("matches").select("*").eq("phase", "group").order("kickoff_utc"),
  ]);

  const teamsMap = new Map((teamsR.data ?? []).map(t => [t.id, { name: t.name, flag_url: t.flag_url }]));

  const merged = (matchesR.data ?? []).map(m => ({
    group_code: m.group_code,
    home_team_id: m.home_team_id,
    away_team_id: m.away_team_id,
    h: m.real_home ?? null,
    a: m.real_away ?? null,
  }));

  const { computeGroupStandings } = await import("@/lib/wc/standings");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Grupos</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {GROUPS.map(g => {
          const teamsInGroup = (teamsR.data ?? []).filter(t => t.group_code === g).map(t => t.id);
          const standings = computeGroupStandings(g, merged, teamsInGroup);
          return (
            <GroupPanel key={g} groupCode={g} standings={standings} teamsMap={teamsMap} />
          );
        })}
      </div>
    </div>
  );
}
