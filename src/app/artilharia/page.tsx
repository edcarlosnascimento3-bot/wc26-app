import { supabaseServer } from "@/lib/supabase/server";

export default async function ArtilhariaPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [goalsR, playersR, teamsR] = await Promise.all([
    supabase.from("goalscorers").select("*").order("goals", { ascending: false }).limit(50),
    supabase.from("players").select("id, name, team_id, photo_url"),
    supabase.from("teams").select("id, name, flag_url"),
  ]);

  const teamsMap = new Map((teamsR.data ?? []).map(t => [t.id, { name: t.name, flag_url: t.flag_url }]));
  const playerMap = new Map((playersR.data ?? []).map(p => [p.id, p]));

  const list = (goalsR.data ?? [])
    .map(g => {
      const player = playerMap.get(g.player_id);
      const team = g.team_id ? teamsMap.get(g.team_id) : null;
      return {
        player_name: player?.name ?? "—",
        photo_url: player?.photo_url ?? null,
        team_name: team?.name ?? g.team_id,
        flag_url: team?.flag_url ?? null,
        goals: g.goals,
      };
    })
    .filter(g => g.player_name !== "—");

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Artilharia</h1>
      {(list.length === 0 || Object.keys(goalsR.data ?? {}).length === 0) && (
        <div className="rounded-xl border bg-white p-8 text-center space-y-3">
          <p className="text-lg font-medium">Em breve</p>
          <p className="text-sm opacity-60">
            A artilharia será atualizada automaticamente conforme os jogos forem realizados
          </p>
        </div>
      )}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="grid grid-cols-[auto_auto_1fr_auto] gap-3 text-xs font-semibold opacity-70 p-3 border-b">
          <div>#</div>
          <div></div>
          <div>Jogador</div>
          <div>Gols</div>
        </div>
        <div className="divide-y">
          {list.map((g, i) => (
            <div key={i} className="grid grid-cols-[auto_auto_1fr_auto] gap-3 items-center p-3 text-sm">
              <div className="w-6 text-center font-bold opacity-50">{i + 1}</div>
              <div className="w-8 h-8 shrink-0">
                {g.photo_url ? (
                  <img src={g.photo_url} alt="" className="w-8 h-8 rounded-full object-cover border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {g.player_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 truncate">
                {g.flag_url && <img src={g.flag_url} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm shrink-0" />}
                <span className="font-medium truncate">{g.player_name}</span>
                <span className="text-xs opacity-50 shrink-0">{g.team_name}</span>
              </div>
              <div className="font-bold text-lg">{g.goals}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
