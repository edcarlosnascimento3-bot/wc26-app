"use client";
import { StandingsTable } from "./StandingsTable";

type Props = {
  groupCode: string;
  standings: any[];
  teamsMap: Map<string, { name: string; flag_url: string | null }>;
};

export function GroupPanel({ groupCode, standings, teamsMap }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Grupo {groupCode}</h2>
      <StandingsTable rows={standings} teamsMap={teamsMap} />
    </div>
  );
}
