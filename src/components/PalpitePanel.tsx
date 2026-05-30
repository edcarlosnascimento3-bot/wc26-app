"use client";
import { MatchCard } from "./MatchCard";

type Props = {
  groupCode: string;
  matches: any[];
  predictionsMap: Map<string, any>;
  teamsMap: Map<string, { name: string; flag_url: string | null }>;
  venuesMap?: Record<string, { name: string; city: string }>;
};

export function PalpitePanel({ groupCode, matches, predictionsMap, teamsMap, venuesMap }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Grupo {groupCode}</h2>
      {matches.map(m => (
        <MatchCard key={m.id} match={m} prediction={predictionsMap.get(m.id)} teamsMap={teamsMap} venuesMap={venuesMap} />
      ))}
      {matches.length === 0 && (
        <p className="text-sm opacity-50 italic">Nenhum confronto disponível</p>
      )}
    </div>
  );
}
