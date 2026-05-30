"use client";

import { useEffect, useState } from "react";
import { PartidaCard } from "./PartidaCard";

export function PhaseMatches({ fase }: { fase?: string }) {
  const [data, setData] = useState<{
    phase: string;
    label: string;
    matches: any[];
    teamsMap: Record<string, { name: string; flag_url: string | null }>;
    groupDone: boolean;
    scorersByMatch?: Record<string, any[]>;
  } | null>(null);

  useEffect(() => {
    const url = fase ? `/api/current-phase?fase=${fase}` : "/api/current-phase";
    fetch(url).then(r => r.ok && r.json()).then(j => setData(j)).catch(() => setData(null));
  }, [fase]);

  if (!data) return <p className="text-sm opacity-50 italic">Carregando...</p>;

  const teamsMap = new Map(Object.entries(data.teamsMap));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{data.label}</h1>
      {data.matches.length === 0 && (
        <p className="text-sm opacity-50 italic">Nenhuma partida encontrada para esta fase.</p>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {data.matches.map(m => (
          <PartidaCard key={m.slot ?? m.id} match={m} teamsMap={teamsMap} scorers={data.scorersByMatch?.[m.id ?? m.slot]} />
        ))}
      </div>
    </div>
  );
}
