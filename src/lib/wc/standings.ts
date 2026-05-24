export type Row = {
  teamId: string;
  P: number; W: number; D: number; L: number;
  GF: number; GA: number; GD: number; pts: number;
};

export function computeGroupStandings(group: string, matches: any[], teamsInGroup: string[]) {
  const table = new Map<string, Row>();
  teamsInGroup.forEach(t => table.set(t, { teamId:t,P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,pts:0 }));

  const relevant = matches.filter((m:any) => m.group_code === group && m.h != null && m.a != null);

  for (const m of relevant) {
    const home = table.get(m.home_team_id)!;
    const away = table.get(m.away_team_id)!;

    home.P++; away.P++;
    home.GF += m.h; home.GA += m.a;
    away.GF += m.a; away.GA += m.h;

    if (m.h > m.a) { home.W++; away.L++; home.pts += 3; }
    else if (m.h < m.a) { away.W++; home.L++; away.pts += 3; }
    else { home.D++; away.D++; home.pts += 1; away.pts += 1; }
  }

  for (const r of table.values()) r.GD = r.GF - r.GA;

  return [...table.values()].sort((x,y) =>
    y.pts - x.pts || y.GD - x.GD || y.GF - x.GF || x.teamId.localeCompare(y.teamId)
  );
}
