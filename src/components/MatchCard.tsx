"use client";
import { useState, useEffect } from "react";
import { fmtBR } from "@/lib/wc/tz";

type TeamInfo = { name: string; flag_url: string | null };

type Props = {
  match: any;
  prediction?: any;
  onSaved?: () => void;
  teamsMap?: Map<string, TeamInfo>;
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return "";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  if (days > 0) return `${days}d ${hh}:${mm}:${ss}`;
  return `${hh}:${mm}:${ss}`;
}

export function MatchCard({ match, prediction, onSaved, teamsMap }: Props) {
  const map = teamsMap ?? new Map();
  const [h, setH] = useState<number | "">(prediction?.pred_home ?? "");
  const [a, setA] = useState<number | "">(prediction?.pred_away ?? "");
  const [now, setNow] = useState(Date.now());
  const [saved, setSaved] = useState(!!prediction);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const kickoff = new Date(match.kickoff_utc).getTime();
  const diff = kickoff - now;
  const isPast = diff <= 0;
  const blocked = diff <= 30 * 60 * 1000;
  const isWarning = diff <= 35 * 60 * 1000 && !isPast;

  const home = map.get(match.home_team_id);
  const away = map.get(match.away_team_id);

  const isEncerrado = (blocked || isPast) && !saved;
  const canEdit = saved && !editing && !blocked && !isPast;

  async function save() {
    if (blocked || isPast) return;
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          predHome: h === "" ? null : Number(h),
          predAway: a === "" ? null : Number(a)
        })
      });
      if (res.ok) { setSaved(true); setEditing(false); onSaved?.(); }
    } catch {}
  }

  return (
    <div className="rounded-xl border p-3 space-y-2 bg-white">
      <div className="flex justify-between text-sm opacity-70">
        <span>{match.phase === "group" ? `Grupo ${match.group_code}` : match.phase.toUpperCase()}</span>
        <span>{fmtBR(match.kickoff_utc)}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center justify-center gap-2 flex-1 flex-wrap">
          {home?.flag_url && <img src={home.flag_url} alt="" className="w-7 h-5 object-cover rounded shadow-sm shrink-0" />}
          <span className="text-[13px] font-medium whitespace-nowrap">{home?.name ?? match.home_team_id}</span>

          <input className="w-11 border rounded-md px-1 py-1 text-center disabled:opacity-40 disabled:cursor-not-allowed" value={h}
            onChange={(e)=>setH(e.target.value==="" ? "" : Number(e.target.value))}
            inputMode="numeric" disabled={editing ? false : (saved || blocked || isPast)} />
          <span className="font-semibold">X</span>
          <input className="w-11 border rounded-md px-1 py-1 text-center disabled:opacity-40 disabled:cursor-not-allowed" value={a}
            onChange={(e)=>setA(e.target.value==="" ? "" : Number(e.target.value))}
            inputMode="numeric" disabled={editing ? false : (saved || blocked || isPast)} />

          <span className="text-[13px] font-medium whitespace-nowrap">{away?.name ?? match.away_team_id}</span>
          {away?.flag_url && <img src={away.flag_url} alt="" className="w-7 h-5 object-cover rounded shadow-sm shrink-0" />}
        </div>

        {saved && !editing ? (
          <div className="flex items-center gap-1 shrink-0">
            <button disabled className="rounded-lg bg-green-800 text-white font-bold px-3 py-1 text-sm cursor-not-allowed">
              Salvo
            </button>
            {canEdit ? (
              <button onClick={() => setEditing(true)} title="Editar palpite"
                className="rounded-lg bg-gray-200 hover:bg-gray-300 px-2 py-1 text-sm transition-colors">
                ✏️
              </button>
            ) : (
              <button disabled className="rounded-lg bg-gray-200 px-2 py-1 text-sm opacity-30 cursor-not-allowed">
                ✏️
              </button>
            )}
          </div>
        ) : editing && (blocked || isPast) ? (
          <div className="flex items-center gap-1 shrink-0">
            <button disabled className="rounded-lg bg-green-800 text-white font-bold px-3 py-1 text-sm cursor-not-allowed">
              Salvo
            </button>
            <button disabled className="rounded-lg bg-gray-200 px-2 py-1 text-sm opacity-30 cursor-not-allowed">
              ✏️
            </button>
          </div>
        ) : isEncerrado ? (
          <button disabled className="rounded-lg bg-red-600 text-black font-bold px-3 py-1 text-sm shrink-0 cursor-not-allowed">
            Encerrado
          </button>
        ) : (
          <button onClick={save} disabled={blocked || isPast}
            className="rounded-lg bg-black text-white px-3 py-1 text-sm hover:bg-gray-800 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed">
            Salvar
          </button>
        )}
      </div>

      <div className="text-right text-xs font-mono">
        {isPast ? (
          <span className="text-green-600 font-semibold">Partida em andamento</span>
        ) : (
          <span className={isWarning ? "text-red-500 animate-pulse font-semibold" : "text-blue-900 font-bold"}>
            {formatCountdown(diff)}
          </span>
        )}
      </div>
    </div>
  );
}
