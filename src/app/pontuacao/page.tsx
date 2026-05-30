import { supabaseServer } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { OnlineDot } from "@/components/OnlineDot";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function PontuacaoPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  await supabase.from("profiles").upsert({
    id: auth.user.id,
    display_name: auth.user.email?.split("@")[0] ?? "Usuário",
  }, { onConflict: "id", ignoreDuplicates: true });

  const [profilesR, teamsR] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, last_seen_at"),
    supabase.from("teams").select("id, name, flag_url"),
  ]);

  const teamsMap = new Map((teamsR.data ?? []).map(t => [t.id, { name: t.name, flag_url: t.flag_url }]));

  const userIds = (profilesR.data ?? []).map(u => u.id);
  if (userIds.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Pontuação</h1>
        <p className="text-sm opacity-50 italic">Nenhum usuário cadastrado ainda.</p>
      </div>
    );
  }

  const [predsR, champR, matchesR] = await Promise.all([
    supabase.from("predictions").select("user_id, match_id, pred_home, pred_away"),
    supabaseAdmin.from("champion_picks").select("user_id, team_id"),
    supabase.from("matches").select("id, real_home, real_away"),
  ]);

  const matchScores = new Map();
  for (const m of matchesR.data ?? []) {
    matchScores.set(m.id, { h: m.real_home, a: m.real_away });
  }

  const userData = new Map();
  for (const u of profilesR.data ?? []) {
    userData.set(u.id, {
      display_name: u.display_name ?? u.id.slice(0, 8),
      avatar_url: u.avatar_url,
      last_seen_at: u.last_seen_at,
      points: 0,
      champPicks: [],
    });
  }

  for (const p of predsR.data ?? []) {
    const real = matchScores.get(p.match_id);
    if (real && real.h != null && real.a != null && p.pred_home != null && p.pred_away != null) {
      const user = userData.get(p.user_id);
      if (user) {
        if (p.pred_home === real.h && p.pred_away === real.a) {
          user.points += 6;
        } else if (
          (p.pred_home > p.pred_away && real.h > real.a) ||
          (p.pred_home < p.pred_away && real.h < real.a)
        ) {
          user.points += 3;
        } else if (p.pred_home === p.pred_away && real.h === real.a) {
          user.points += 1;
        }
      }
    }
  }

  for (const c of champR.data ?? []) {
    const user = userData.get(c.user_id);
    if (user) user.champPicks.push(c.team_id);
  }

  const sorted = [...userData.entries()]
    .map(([id, u]) => ({ id, ...u }))
    .sort((a, b) => b.points - a.points);

  const ord = ["1º", "2º", "3º"];

  return (
    <div className="space-y-4 max-w-7xl">
      <h1 className="text-2xl font-semibold">Pontuação</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="grid grid-cols-[auto_auto_1fr_auto] gap-3 text-xs font-semibold opacity-70 p-3 border-b items-center">
            <div>#</div>
            <div></div>
            <div>Usuário</div>
            <div className="text-right">Pts</div>
          </div>
          <div className="divide-y">
            {sorted.map((u, i) => (
              <div key={u.id} className="grid grid-cols-[auto_auto_1fr_auto] gap-3 items-center p-3 text-sm h-[52px]">
                <div className="w-6 text-center font-bold opacity-50">{i + 1}</div>
                <div className="w-8 h-8 shrink-0">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {u.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{u.display_name}</span>
                  <OnlineDot lastSeenAt={u.last_seen_at} userId={u.id} />
                </div>
                <div className="font-bold text-lg text-right flex items-center justify-end gap-2">
                  <span>{u.points}</span>
                  <a href={`/comparar?com=${u.id}`}
                    className="text-xs font-normal text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap opacity-80 hover:opacity-100">
                    Ver Palpites
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="grid grid-cols-[auto_auto_1fr_auto] gap-3 text-xs font-semibold opacity-70 p-3 border-b items-center">
            <div></div>
            <div></div>
            <div className="text-center">Meu palpite de campeão</div>
            <div></div>
          </div>
          <div className="divide-y">
            {sorted.map((u, i) => (
              <div key={u.id} className="grid grid-cols-[auto_auto_1fr_auto] gap-3 items-center p-3 text-sm h-[52px]">
                <div></div>
                <div></div>
                <div className="flex items-center justify-center gap-3">
                  {u.champPicks.length > 0 ? u.champPicks.map((t: string, j: number) => {
                    const team = teamsMap.get(t);
                    return (
                      <span key={t} className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                        <span className="font-bold">{ord[j]}</span>
                        {team?.flag_url && <img src={team.flag_url} alt="" className="w-8 h-6 object-cover rounded shadow-sm" />}
                        <span>{team?.name ?? t}</span>
                      </span>
                    );
                  }) : (
                    <span className="text-xs opacity-30 italic">Nenhum palpite</span>
                  )}
                </div>
                <div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="text-xs font-semibold opacity-70 p-3 border-b">Regras de Pontuação</div>
          <div className="p-3 space-y-2 text-sm">
            <ul className="space-y-1.5 text-xs whitespace-nowrap">
              <li><span className="font-bold text-black">6 pontos</span> — Palpite igual ao resultado exato da partida</li>
              <li><span className="font-bold text-black">3 pontos</span> — Acertou o vencedor, mas não o placar exato</li>
              <li><span className="font-bold text-black">1 ponto</span> — Empate</li>
              <li><span className="font-bold text-black">0 ponto</span> — Errou o resultado (não perde ponto)</li>
            </ul>
            <p className="text-xs text-black pt-2"><span className="font-bold">*Obs — </span>Na fase de mata-mata caso a seleção vença nos pênaltis será acrescido 2 pontos na tabela de pontuação.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
