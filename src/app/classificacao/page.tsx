"use client";
import { useEffect, useState } from "react";
import { StandingsTable } from "@/components/StandingsTable";

const GROUPS = "ABCDEFGHIJKL".split("");

export default function ClassificacaoPage() {
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/standings");
      if (r.ok) setData(await r.json());
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const teamsMap = new Map<string, { name: string; flag_url: string | null }>();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Classificação</h1>
      {loading && <p className="text-sm opacity-50">Carregando...</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {GROUPS.map(g => {
          const rows = (data[g] ?? []).map((r: any) => ({
            ...r,
          }));
          for (const r of rows) {
            teamsMap.set(r.teamId, { name: r.teamName, flag_url: r.flagUrl });
          }
          return (
            <div key={g} className="space-y-2">
              <h2 className="font-semibold text-lg">Grupo {g}</h2>
              <StandingsTable rows={rows} teamsMap={teamsMap} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
