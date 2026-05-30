"use client";
import { useState, useEffect } from "react";
import { fmtBR } from "@/lib/wc/tz";

type Props = {
  match: any;
  teamsMap: Map<string, { name: string; flag_url: string | null }>;
  venuesMap?: Record<string, { name: string; city: string }>;
  prediction?: any;
  scorers?: { player: string; team_id: string; goals: number }[];
};

const cardPhaseLabels: Record<string, string> = {
  r32: "32 Ávos", r16: "Oitavas", qf: "Quartas",
  sf: "Semifinal", "3p": "3º Lugar", final: "Final",
};

function fmtSource(token: string | null): string {
  if (!token) return "A definir";
  const m = token.match(/^([A-L])([123])$/);
  if (m) {
    const ordem = m[2] === "1" ? "1º" : m[2] === "2" ? "2º" : "3º";
    return `${ordem} Grupo ${m[1]}`;
  }
  if (token.startsWith("3#")) return `${token.slice(2)}º melhor 3º lugar`;
  if (token.startsWith("W:")) return `Ven. ${token.slice(2)}`;
  if (token.startsWith("L:")) return `Perd. ${token.slice(2)}`;
  return token;
}

export function PartidaCard({ match, teamsMap, venuesMap, prediction, scorers }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const homeId = match.home_team_id ?? match.homeTeamId;
  const awayId = match.away_team_id ?? match.awayTeamId;
  const home = teamsMap.get(homeId);
  const away = teamsMap.get(awayId);
  const kickoffUTC = match.kickoff_utc ?? match.kickoffUTC;
  const kickoff = kickoffUTC ? new Date(kickoffUTC).getTime() : 0;
  const isPast = kickoffUTC ? kickoff <= now : false;

  const showHome = match.real_home != null ? match.real_home : (match.homeScore ?? 0);
  const showAway = match.real_away != null ? match.real_away : (match.awayScore ?? 0);
  const isFinished = match.real_home != null && match.real_away != null;

  const r = match.round ?? match.phase;
  const phaseLabel = r === "group" ? `Grupo ${match.group_code}` : (cardPhaseLabels[r] ?? r?.toUpperCase() ?? "");

  const venueId = match.venue_id ?? match.venueId;
  const venue = venuesMap?.[venueId];

  const homeScorers = scorers?.filter(s => s.team_id === homeId) ?? [];
  const awayScorers = scorers?.filter(s => s.team_id === awayId) ?? [];

  return (
    <div className="rounded-xl border p-4 bg-gray-200 flex flex-col">
      <div className="flex justify-between text-xs gap-2">
        <span className="opacity-60 shrink-0">{phaseLabel}</span>
        {venue && <span className="opacity-60 truncate">{venue.name}, {venue.city}</span>}
        {isPast ? (
          <span className="text-yellow-500 font-bold shrink-0">Partida em andamento</span>
        ) : kickoffUTC ? (
          <span className="opacity-60 shrink-0">{fmtBR(kickoffUTC)}</span>
        ) : (
          <span className="opacity-60 shrink-0">Horário a definir</span>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-3">
        <div className="flex justify-center gap-3 items-start">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              {home?.flag_url && <img src={home.flag_url} alt="" className="w-8 h-6 object-cover rounded shadow-sm shrink-0" />}
              <span className="text-sm font-medium truncate">{home?.name ?? (homeId ? fmtSource(match.homeFrom ?? match.home_source) : "—")}</span>
            </div>
            {isFinished && homeScorers.length > 0 && (
              <div className="text-left text-[11px] font-bold text-blue-600 leading-snug w-full mt-2">
                {homeScorers.map((s, i) => (
                  <div key={i}>{s.player}{s.goals > 1 ? ` (${s.goals})` : ""}</div>
                ))}
              </div>
            )}
          </div>
          <span className="font-bold text-lg shrink-0">{showHome} x {showAway}</span>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 flex-row-reverse">
              {away?.flag_url && <img src={away.flag_url} alt="" className="w-8 h-6 object-cover rounded shadow-sm shrink-0" />}
              <span className="text-sm font-medium truncate">{away?.name ?? (awayId ? fmtSource(match.awayFrom ?? match.away_source) : "—")}</span>
            </div>
            {isFinished && awayScorers.length > 0 && (
              <div className="text-right text-[11px] font-bold text-blue-600 leading-snug w-full mt-2">
                {awayScorers.map((s, i) => (
                  <div key={i}>{s.player}{s.goals > 1 ? ` (${s.goals})` : ""}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {prediction?.pred_home != null && prediction?.pred_away != null && (
        <div className="flex items-center justify-center gap-2 pt-1 border-t text-sm">
          <span className="text-sm font-medium">Palpite</span>
          <span className="text-lg">&#8594;</span>
          <span className="font-bold">{prediction.pred_home} x {prediction.pred_away}</span>
        </div>
      )}
    </div>
  );
}
