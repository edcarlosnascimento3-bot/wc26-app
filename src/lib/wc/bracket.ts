type StandingRow = { teamId: string; pts: number; GD: number; GF: number; GA: number; P: number; W: number; D: number; L: number };

export type BracketSlot = {
  slot: string;
  round: "r32" | "r16" | "qf" | "sf" | "3p" | "final";
  order_index: number;
  home_source: string | null;
  away_source: string | null;
  winner_to_slot: string | null;
  winner_to_side: "home" | "away" | null;
  loser_to_slot: string | null;
  loser_to_side: "home" | "away" | null;
  kickoff_utc_override?: string | null;
  venue_id_override?: string | null;
  meta?: any;
};

export type MatchResolved = {
  slot: string;
  round: BracketSlot["round"];
  order: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeFrom: string | null;
  awayFrom: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: string | null;
  loserTeamId: string | null;
  kickoffUTC?: string | null;
  venueId?: string | null;
};

type SourceContext = {
  standingsByGroup: Record<string, StandingRow[]>;
  thirdPlaceRank: { token: string; teamId: string }[];
  resultsBySlot: Record<string, { home: number|null; away: number|null; winner: string|null; loser: string|null }>;
};

function pickWinner(homeId: string|null, awayId: string|null, h: number|null, a: number|null) {
  if (!homeId || !awayId || h == null || a == null) return { winner: null, loser: null };
  if (h > a) return { winner: homeId, loser: awayId };
  if (a > h) return { winner: awayId, loser: homeId };
  return { winner: null, loser: null };
}

export function computeThirdPlaceRank(standingsByGroup: Record<string, StandingRow[]>) {
  const thirds: { group: string; row: StandingRow }[] = [];

  for (const [g, rows] of Object.entries(standingsByGroup)) {
    if (rows?.length >= 3) thirds.push({ group: g, row: rows[2] });
  }

  const sorted = thirds
    .map(x => ({ group: x.group, ...x.row }))
    .sort((a,b) =>
      (b.pts - a.pts) ||
      (b.GD - a.GD) ||
      (b.GF - a.GF) ||
      (a.teamId.localeCompare(b.teamId))
    );

  return sorted.slice(0, 8).map((r, i) => ({ token: `3#${i+1}`, teamId: r.teamId, group: r.group }));
}

export function resolveSource(token: string | null, ctx: SourceContext): string | null {
  if (!token) return null;

  if (token.startsWith("W:")) {
    const s = token.slice(2);
    return ctx.resultsBySlot[s]?.winner ?? null;
  }
  if (token.startsWith("L:")) {
    const s = token.slice(2);
    return ctx.resultsBySlot[s]?.loser ?? null;
  }

  if (token.startsWith("3#")) {
    const hit = ctx.thirdPlaceRank.find(x => x.token === token);
    return hit?.teamId ?? null;
  }

  const m = token.match(/^([A-L])([123])$/i);
  if (m) {
    const group = m[1].toUpperCase();
    const pos = Number(m[2]);
    const rows = ctx.standingsByGroup[group] ?? [];
    return rows[pos - 1]?.teamId ?? null;
  }

  return token;
}

export function buildBracket(
  slots: BracketSlot[],
  standingsByGroup: Record<string, StandingRow[]>,
  scoreBySlot: Record<string, { home: number|null; away: number|null }>,
  overrides?: Record<string, { kickoffUTC?: string|null; venueId?: string|null }>
): MatchResolved[] {

  const third = computeThirdPlaceRank(standingsByGroup);
  const resultsBySlot: SourceContext["resultsBySlot"] = {};

  const ctxBase: SourceContext = { standingsByGroup, thirdPlaceRank: third.map(t => ({ token: t.token, teamId: t.teamId })), resultsBySlot };

  const roundOrder: BracketSlot["round"][] = ["r32","r16","qf","sf","3p","final"];
  const sortedSlots = [...slots].sort((a,b) =>
    roundOrder.indexOf(a.round) - roundOrder.indexOf(b.round) || a.order_index - b.order_index
  );

  const out: MatchResolved[] = [];

  for (const s of sortedSlots) {
    const score = scoreBySlot[s.slot] ?? { home: null, away: null };

    const homeId = resolveSource(s.home_source, ctxBase);
    const awayId = resolveSource(s.away_source, ctxBase);

    const { winner, loser } = pickWinner(homeId, awayId, score.home, score.away);

    resultsBySlot[s.slot] = { home: score.home, away: score.away, winner, loser };

    out.push({
      slot: s.slot,
      round: s.round,
      order: s.order_index,
      homeTeamId: homeId,
      awayTeamId: awayId,
      homeFrom: s.home_source,
      awayFrom: s.away_source,
      homeScore: score.home,
      awayScore: score.away,
      winnerTeamId: winner,
      loserTeamId: loser,
      kickoffUTC: overrides?.[s.slot]?.kickoffUTC ?? s.kickoff_utc_override ?? null,
      venueId: overrides?.[s.slot]?.venueId ?? s.venue_id_override ?? null
    });
  }

  return out;
}
