"use client";
import { useEffect, useState } from "react";
import { BracketTree } from "@/components/BracketTree";

export default function ChaveamentoPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [teamsMap, setTeamsMap] = useState<Record<string, { name: string; flag_url: string | null }>>({});
  const [venuesMap, setVenuesMap] = useState<Record<string, { name: string; city: string }>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/bracket");
      if (r.ok) {
        const j = await r.json();
        setMatches(j.bracket ?? []);
        setTeamsMap(j.teamsMap ?? {});
        setVenuesMap(j.venuesMap ?? {});
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Chaveamento</h1>
      {loading && <p className="text-sm opacity-50">Carregando...</p>}
      {!loading && matches.length === 0 && (
        <p className="text-sm opacity-50 italic">
          Dados do chaveamento indisponíveis. Faça o sync e configure os bracket_slots no banco.
        </p>
      )}
      <BracketTree matches={matches} teamsMap={teamsMap} venuesMap={venuesMap} />
    </div>
  );
}
