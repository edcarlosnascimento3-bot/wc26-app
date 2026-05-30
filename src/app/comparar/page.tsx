import { fmtBR } from "@/lib/wc/tz";
import { supabaseServer } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function scoreLabel(realH: number | null, realA: number | null, predH: number | null, predA: number | null): { pts: number; label: string } {
  if (realH == null || realA == null || predH == null || predA == null) return { pts: 0, label: "—" };
  if (predH === realH && predA === realA) return { pts: 6, label: "6 pts" };
  const rO = realH === realA ? "D" : realH > realA ? "H" : "A";
  const pO = predH === predA ? "D" : predH > predA ? "H" : "A";
  if (rO === pO && rO === "D") return { pts: 1, label: "1 pt" };
  if (rO === pO) return { pts: 3, label: "3 pts" };
  return { pts: 0, label: "0 pt" };
}

export default async function CompararPage({
  searchParams,
}: {
  searchParams: Promise<{ com?: string }>;
}) {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { com } = await searchParams;
  if (!com || com === auth.user.id) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Comparar Palpites</h1>
        <p className="text-sm opacity-50 italic">Selecione um usuário na página de pontuação para comparar palpites.</p>
        <Link href="/pontuacao" className="text-sm text-blue-600 underline">← Voltar para Pontuação</Link>
      </div>
    );
  }

  const [profilesR, teamsR, matchesR, myPredsR, theirPredsR] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url"),
    supabase.from("teams").select("id, name, flag_url"),
    supabase.from("matches").select("id, phase, group_code, home_team_id, away_team_id, real_home, real_away, kickoff_utc").order("kickoff_utc"),
    supabase.from("predictions").select("match_id, pred_home, pred_away").eq("user_id", auth.user.id),
    supabaseAdmin.from("predictions").select("match_id, pred_home, pred_away").eq("user_id", com),
  ]);

  const teamsMap = new Map((teamsR.data ?? []).map(t => [t.id, { name: t.name, flag_url: t.flag_url }]));

  const myProf = (profilesR.data ?? []).find(p => p.id === auth.user.id);
  const theirProf = (profilesR.data ?? []).find(p => p.id === com);

  const myPreds = new Map((myPredsR.data ?? []).map(p => [p.match_id, p]));
  const theirPreds = new Map((theirPredsR.data ?? []).map(p => [p.match_id, p]));

  const matches = matchesR.data ?? [];

  let myTotal = 0, theirTotal = 0;
  for (const m of matches) {
    if (m.real_home == null || m.real_away == null) continue;
    const mp = myPreds.get(m.id);
    const tp = theirPreds.get(m.id);
    if (mp) myTotal += scoreLabel(m.real_home, m.real_away, mp.pred_home, mp.pred_away).pts;
    if (tp) theirTotal += scoreLabel(m.real_home, m.real_away, tp.pred_home, tp.pred_away).pts;
  }

  const phaseOrder = ["group", "r32", "r16", "qf", "sf", "3p", "final"];
  const phaseLabels: Record<string, string> = {
    group: "Fase de Grupos", r32: "32 Ávos", r16: "Oitavas",
    qf: "Quartas", sf: "Semifinal", "3p": "3º Lugar", final: "Final",
  };

  const grouped = new Map<string, typeof matches>();
  for (const phase of phaseOrder) {
    const list = matches.filter(m => m.phase === phase);
    if (list.length > 0) grouped.set(phase, list);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Comparar Palpites</h1>
        <Link href="/pontuacao" className="text-sm text-blue-600 underline">← Voltar</Link>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            {myProf?.avatar_url ? (
              <img src={myProf.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {(myProf?.display_name ?? "EU").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold truncate">{myProf?.display_name ?? "Você"}</span>
          </div>
          <div className="text-2xl font-bold">{myTotal} pts</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center flex flex-col items-center justify-center">
          <span className="text-xs opacity-50">VS</span>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-semibold truncate">{theirProf?.display_name ?? "Usuário"}</span>
            {theirProf?.avatar_url ? (
              <img src={theirProf.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                {(theirProf?.display_name ?? "EL").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-2xl font-bold">{theirTotal} pts</div>
        </div>
      </div>

      {/* Comparison table */}
      {[...grouped.entries()].map(([phase, phaseMatches]) => (
        <div key={phase} className="rounded-xl border bg-white overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b font-semibold text-sm">
            {phaseLabels[phase] ?? phase.toUpperCase()}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold opacity-70">
                  <th className="text-left px-3 py-2">Partida</th>
                  <th className="text-center px-2 py-2">Data</th>
                  <th className="text-center px-2 py-2">Resultado</th>
                  <th className="text-center px-2 py-2 border-l bg-blue-50/50">{myProf?.display_name ?? "Você"}</th>
                  <th className="text-center px-2 py-2 border-l bg-green-50/50">{theirProf?.display_name ?? "Outro"}</th>
                  <th className="text-center px-2 py-2 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {phaseMatches.map(m => {
                  const home = teamsMap.get(m.home_team_id);
                  const away = teamsMap.get(m.away_team_id);
                  const mp = myPreds.get(m.id);
                  const tp = theirPreds.get(m.id);
                  const hasResult = m.real_home != null && m.real_away != null;

                  const myScore = mp ? scoreLabel(m.real_home, m.real_away, mp.pred_home, mp.pred_away) : null;
                  const theirScore = tp ? scoreLabel(m.real_home, m.real_away, tp.pred_home, tp.pred_away) : null;

                  const samePred = mp && tp && mp.pred_home === tp.pred_home && mp.pred_away === tp.pred_away;

                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {home?.flag_url && <img src={home.flag_url} alt="" className="w-5 h-4 object-cover rounded shadow-sm" />}
                          <span className="font-medium">{home?.name ?? m.home_team_id}</span>
                          <span className="text-xs opacity-40">vs</span>
                          <span className="font-medium">{away?.name ?? m.away_team_id}</span>
                          {away?.flag_url && <img src={away.flag_url} alt="" className="w-5 h-4 object-cover rounded shadow-sm" />}
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-center text-xs opacity-60 whitespace-nowrap">
                        {fmtBR(m.kickoff_utc)}
                      </td>
                      <td className="px-2 py-2.5 text-center font-bold whitespace-nowrap">
                        {hasResult ? `${m.real_home} x ${m.real_away}` : "—"}
                      </td>
                      <td className={`px-2 py-2.5 text-center border-l whitespace-nowrap ${mp ? "bg-blue-50/50" : ""}`}>
                        {mp ? (
                          <span className={myScore && myScore.pts > 0 ? "text-green-700 font-bold" : ""}>
                            {mp.pred_home} x {mp.pred_away}
                            {hasResult && myScore && myScore.label !== "—" && <span className="text-[10px] ml-1 opacity-60">({myScore.label})</span>}
                          </span>
                        ) : (
                          <span className="text-xs opacity-30 italic">—</span>
                        )}
                      </td>
                      <td className={`px-2 py-2.5 text-center border-l whitespace-nowrap ${tp ? "bg-green-50/50" : ""}`}>
                        {tp ? (
                          <span className={theirScore && theirScore.pts > 0 ? "text-green-700 font-bold" : ""}>
                            {tp.pred_home} x {tp.pred_away}
                            {hasResult && theirScore && theirScore.label !== "—" && <span className="text-[10px] ml-1 opacity-60">({theirScore.label})</span>}
                          </span>
                        ) : (
                          <span className="text-xs opacity-30 italic">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        {mp && tp ? (
                          samePred ? (
                            <span title="Mesmo palpite" className="text-sm">🤝</span>
                          ) : (
                            <span title="Palpites diferentes" className="text-sm">⚡</span>
                          )
                        ) : (
                          <span className="text-xs opacity-20">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
