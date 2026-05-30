"use client";

import { useMemo } from "react";

type MatchResolved = {
  slot: string;
  round: "r32" | "r16" | "qf" | "sf" | "3p" | "final";
  order: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeFrom: string | null;
  awayFrom: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: string | null;
  kickoffUTC?: string | null;
  venueId?: string | null;
};

const roundLabels: Record<string, string> = {
  r32: "32 Ávos", r16: "Oitavas", qf: "Quartas",
  sf: "Semifinal",
};

const ROUND_ORDER = ["r32", "r16", "qf", "sf"] as const;

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

const CARD_H = 72;
const CARD_GAP = 16;
const CENTER_GAP = 40;
const COL_W = 190;
const CENTER_W = 280;
const FINAL_CARD_H = 100;
const HEADER_H = 28;

function posY(index: number, total: number, maxCount: number): number {
  if (total === 0) return 0;
  const colSpan = maxCount / total;
  return index * colSpan * (CARD_H + CARD_GAP) + (colSpan - 1) * (CARD_H + CARD_GAP) / 2;
}

function getColX(side: 'left' | 'center' | 'right', ri?: number) {
  if (side === 'left') return ri! * COL_W;
  if (side === 'center') return ROUND_ORDER.length * COL_W;
  if (side === 'right') return ROUND_ORDER.length * COL_W + CENTER_W + (ROUND_ORDER.length - 1 - ri!) * COL_W;
  return 0;
}

export function BracketTree({ matches, teamsMap = {}, venuesMap = {} }: {
  matches: MatchResolved[];
  teamsMap?: Record<string, { name: string; flag_url: string | null }>;
  venuesMap?: Record<string, { name: string; city: string }>;
}) {
  const { roundsLeft, roundsRight, roundsCenter, positions, totalH, conns } = useMemo(() => {
    const byRound: Record<string, MatchResolved[]> = { r32:[], r16:[], qf:[], sf:[], "3p":[], final:[] };
    for (const m of matches) if (byRound[m.round]) byRound[m.round].push(m);
    for (const k of Object.keys(byRound)) byRound[k].sort((a, b) => a.order - b.order);

    const rLeft: Record<string, MatchResolved[]> = {};
    const rRight: Record<string, MatchResolved[]> = {};

    for (const r of ROUND_ORDER) {
      const list = byRound[r] ?? [];
      const half = Math.ceil(list.length / 2);
      rLeft[r] = list.slice(0, half);
      rRight[r] = list.slice(half);
    }

    const finals = [...(byRound.final ?? []), ...(byRound["3p"] ?? [])];
    const rCenter = { finals };

    const maxCount = Math.max(rLeft.r32?.length || 1, rRight.r32?.length || 1);
    const pos = new Map<string, { top: number; height: number; side: 'left' | 'right' | 'center' }>();

    for (const r of ROUND_ORDER) {
      const listL = rLeft[r] ?? [];
      listL.forEach((m, i) => {
        pos.set(m.slot, { top: posY(i, listL.length, maxCount) + HEADER_H, height: CARD_H, side: 'left' });
      });
      const listR = rRight[r] ?? [];
      listR.forEach((m, i) => {
        pos.set(m.slot, { top: posY(i, listR.length, maxCount) + HEADER_H, height: CARD_H, side: 'right' });
      });
    }

    const totalBracketHeight = maxCount * (CARD_H + CARD_GAP) - CARD_GAP;
    const cy = HEADER_H + totalBracketHeight / 2;

    const finalsH = finals.length * FINAL_CARD_H + Math.max(0, finals.length - 1) * CENTER_GAP;
    const startY = cy - finalsH / 2;

    finals.forEach((m, i) => {
      const offset = i === 0 ? -8 : 8;
      pos.set(m.slot, { top: startY + i * (FINAL_CARD_H + CENTER_GAP) + offset, height: FINAL_CARD_H, side: 'center' });
    });

    const totH = HEADER_H + Math.max(totalBracketHeight, finalsH);

    const connsList: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number }[] = [];

    // Left side connections
    for (let ri = 0; ri < ROUND_ORDER.length - 1; ri++) {
      const r = ROUND_ORDER[ri];
      const nr = ROUND_ORDER[ri + 1];
      const list = rLeft[r] ?? [];
      const nextList = rLeft[nr] ?? [];
      if (list.length < 2 || nextList.length === 0) continue;

      for (let i = 0; i < list.length; i += 2) {
        const ni = Math.floor(i / 2);
        if (ni >= nextList.length) break;
        const m1 = list[i], m2 = list[i + 1], mn = nextList[ni];
        if (!m2) break;
        const p1 = pos.get(m1.slot), p2 = pos.get(m2.slot), pn = pos.get(mn.slot);
        if (!p1 || !p2 || !pn) continue;

        connsList.push({
          x1: getColX('left', ri) + COL_W - 10,
          y1: p1.top + p1.height / 2,
          x2: getColX('left', ri) + COL_W - 10,
          y2: p2.top + p2.height / 2,
          x3: getColX('left', ri + 1),
          y3: pn.top + pn.height / 2,
        });
      }
    }

    // Right side connections
    for (let ri = 0; ri < ROUND_ORDER.length - 1; ri++) {
      const r = ROUND_ORDER[ri];
      const nr = ROUND_ORDER[ri + 1];
      const list = rRight[r] ?? [];
      const nextList = rRight[nr] ?? [];
      if (list.length < 2 || nextList.length === 0) continue;

      for (let i = 0; i < list.length; i += 2) {
        const ni = Math.floor(i / 2);
        if (ni >= nextList.length) break;
        const m1 = list[i], m2 = list[i + 1], mn = nextList[ni];
        if (!m2) break;
        const p1 = pos.get(m1.slot), p2 = pos.get(m2.slot), pn = pos.get(mn.slot);
        if (!p1 || !p2 || !pn) continue;

        connsList.push({
          x1: getColX('right', ri),
          y1: p1.top + p1.height / 2,
          x2: getColX('right', ri),
          y2: p2.top + p2.height / 2,
          x3: getColX('right', ri + 1) + COL_W - 10,
          y3: pn.top + pn.height / 2,
        });
      }
    }

    // Center connections (from Semifinals to Finals)
    const sfLeftList = rLeft.sf ?? [];
    const sfRightList = rRight.sf ?? [];
    const sfL = sfLeftList.length > 0 ? pos.get(sfLeftList[0].slot) : null;
    const sfR = sfRightList.length > 0 ? pos.get(sfRightList[0].slot) : null;

    if (sfL && sfR && finals.length > 0) {
      const yL = sfL.top + sfL.height / 2;
      const yR = sfR.top + sfR.height / 2;
      
      const xL = getColX('left', 3) + COL_W - 10;
      const xR = getColX('right', 3);
      
      const xCL = getColX('center');
      const xCR = getColX('center') + CENTER_W - 10;

      for (const mf of finals) {
        const fp = pos.get(mf.slot);
        if (!fp) continue;
        const yF = fp.top + fp.height / 2;
        
        connsList.push({
          x1: xL, y1: yL, x2: xL, y2: yL, x3: xCL, y3: yF
        });
        connsList.push({
          x1: xR, y1: yR, x2: xR, y2: yR, x3: xCR, y3: yF
        });
      }
    }

    return {
      roundsLeft: rLeft,
      roundsRight: rRight,
      roundsCenter: rCenter,
      positions: pos,
      totalH: totH,
      conns: connsList,
    };
  }, [matches]);

  function renderCard(m: MatchResolved) {
    const pos = positions.get(m.slot);
    if (!pos) return null;

    const homeT = m.homeTeamId ? teamsMap[m.homeTeamId] : undefined;
    const awayT = m.awayTeamId ? teamsMap[m.awayTeamId] : undefined;
    const isCenter = pos.side === 'center';
    const isRight = pos.side === 'right';

    function Row({ tid, t, score, from, isHome }: { tid: string | null; t?: { name: string; flag_url: string | null } | undefined; score: number | null; from: string | null; isHome: boolean }) {
      if (tid && t) {
        return (
          <div className={`flex items-center gap-1.5 h-full min-w-0 font-bold text-black ${isCenter ? 'text-sm' : ''} ${isRight ? 'flex-row-reverse' : ''}`}>
            <span className={`w-4 text-center ${isCenter ? 'text-xs' : 'text-[10px]'} shrink-0`}>{isHome ? (score ?? "—") : ""}</span>
            {isHome && <div className="w-0.5 h-4 rounded-full bg-gray-300 shrink-0" />}
            {t.flag_url && <img src={t.flag_url} alt="" className={`${isCenter ? 'w-6 h-5' : 'w-5 h-4'} object-cover rounded shadow-sm shrink-0`} />}
            <span className={`${isCenter ? 'text-sm' : 'text-xs'} truncate`}>{t.name}</span>
            {!isHome && <div className="w-0.5 h-4 rounded-full bg-gray-300 shrink-0" />}
            <span className={`w-4 text-center ${isCenter ? 'text-xs' : 'text-[10px]'} shrink-0`}>{!isHome ? (score ?? "—") : ""}</span>
          </div>
        );
      }
      return (
        <div className={`flex items-center gap-1.5 h-full ${isCenter ? 'text-xs' : 'text-[10px]'} font-bold text-black ${isRight ? 'flex-row-reverse' : ''}`}>
          {isRight && <span className="flex-1" />}
          <span className="truncate max-w-[130px] text-center">{fmtSource(from)}</span>
          {!isRight && <span className="flex-1" />}
        </div>
      );
    }

    const venueInfo = m.venueId ? venuesMap[m.venueId] : null;

    if (isCenter) {
      return (
        <div key={m.slot}
          className="absolute left-0.5 right-0.5 rounded-lg border-2 border-yellow-500 bg-white z-10 shadow-sm overflow-hidden"
          style={{ top: pos.top, height: pos.height }}
        >
          <div className="flex justify-between items-start px-2 pt-1.5 leading-none gap-1">
            <span className="text-[10px] font-bold text-black shrink-0">{m.slot}</span>
            {venueInfo && <span className="text-[8px] opacity-60 truncate text-right">{venueInfo.name}</span>}
          </div>
          <div className="flex flex-col px-3 pb-2 justify-center" style={{ height: pos.height - 16 }}>
            <div className="flex-1 flex items-center min-h-0 justify-between">
              {(() => {
                const has = !!m.homeTeamId;
                const t = m.homeTeamId ? teamsMap[m.homeTeamId] : undefined;
                if (has && t) return (
                  <div className="flex items-center gap-2 h-full min-w-0 font-bold text-black text-sm">
                    {t.flag_url && <img src={t.flag_url} alt="" className="w-6 h-5 object-cover rounded shadow-sm shrink-0" />}
                    <span className="truncate">{t.name}</span>
                  </div>
                );
                return <span className="text-[11px] font-bold text-black truncate">{fmtSource(m.homeFrom)}</span>;
              })()}
              <span className="mx-2 text-xs font-bold text-black shrink-0">{m.homeScore ?? "—"} x {m.awayScore ?? "—"}</span>
              {(() => {
                const has = !!m.awayTeamId;
                const t = m.awayTeamId ? teamsMap[m.awayTeamId] : undefined;
                if (has && t) return (
                  <div className="flex items-center gap-2 h-full min-w-0 font-bold text-black text-sm flex-row-reverse">
                    {t.flag_url && <img src={t.flag_url} alt="" className="w-6 h-5 object-cover rounded shadow-sm shrink-0" />}
                    <span className="truncate">{t.name}</span>
                  </div>
                );
                return <span className="text-[11px] font-bold text-black truncate">{fmtSource(m.awayFrom)}</span>;
              })()}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={m.slot}
        className="absolute left-0.5 right-0.5 rounded-lg border bg-white z-10 shadow-sm overflow-hidden"
        style={{ top: pos.top, height: pos.height }}
      >
        <div className="flex justify-between items-start px-2 pt-1 leading-none gap-1">
          <span className="text-[9px] font-bold text-black shrink-0">{m.slot}</span>
          {venueInfo && <span className="text-[7px] opacity-60 truncate text-right max-w-[120px]">{venueInfo.name}</span>}
        </div>
        <div className="flex flex-col px-2 pb-1" style={{ height: pos.height - 12, marginTop: -2 }}>
          <div className="flex-1 flex items-center min-h-0">
            <Row tid={m.homeTeamId} t={homeT} score={m.homeScore} from={m.homeFrom} isHome={true} />
          </div>
          <div className="border-t border-gray-100" />
          <div className="flex-1 flex items-center min-h-0">
            <Row tid={m.awayTeamId} t={awayT} score={m.awayScore} from={m.awayFrom} isHome={false} />
          </div>
        </div>
      </div>
    );
  }

  const totalW = ROUND_ORDER.length * 2 * COL_W + (roundsCenter.finals.length > 0 ? CENTER_W : 0) + 20;

  return (
    <div className="overflow-auto pb-4">
      <div className="relative" style={{ width: totalW, minHeight: totalH + 40 }}>
        <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: totalW, height: totalH + 40 }}>
          {conns.map((c, i) => {
            const midX = c.x1 + (c.x3 - c.x1) / 2;
            return (
              <g key={i}>
                <path d={`M ${c.x1} ${c.y1} C ${midX} ${c.y1}, ${midX} ${c.y3}, ${c.x3} ${c.y3}`} fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                {c.x1 !== c.x2 || c.y1 !== c.y2 ? (
                  <path d={`M ${c.x2} ${c.y2} C ${midX} ${c.y2}, ${midX} ${c.y3}, ${c.x3} ${c.y3}`} fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                ) : null}
              </g>
            );
          })}
        </svg>

        {/* Lado Esquerdo */}
        {ROUND_ORDER.map((r, ri) => {
          const list = roundsLeft[r] ?? [];
          if (list.length === 0) return null;
          const firstPos = positions.get(list[0]?.slot);
          const marginTop = firstPos ? firstPos.top - HEADER_H : 0;
          return (
            <div key={`L_${r}`} className="absolute top-0 bottom-0" style={{ left: getColX('left', ri), width: COL_W - 10 }}>
              <div className="text-xs font-semibold text-black text-center mb-2 sticky top-0 bg-gray-50 z-20 py-1" style={{ marginTop }}>
                {roundLabels[r]}
                <span className="font-normal opacity-60 ml-1">({list.length})</span>
              </div>
              {list.map(m => renderCard(m))}
            </div>
          );
        })}

        {/* Lado Direito */}
        {ROUND_ORDER.map((r, ri) => {
          const list = roundsRight[r] ?? [];
          if (list.length === 0) return null;
          const firstPos = positions.get(list[0]?.slot);
          const marginTop = firstPos ? firstPos.top - HEADER_H : 0;
          return (
            <div key={`R_${r}`} className="absolute top-0 bottom-0" style={{ left: getColX('right', ri), width: COL_W - 10 }}>
              <div className="text-xs font-semibold text-black text-center mb-2 sticky top-0 bg-gray-50 z-20 py-1" style={{ marginTop }}>
                {roundLabels[r]}
                <span className="font-normal opacity-60 ml-1">({list.length})</span>
              </div>
              {list.map(m => renderCard(m))}
            </div>
          );
        })}

        {/* Centro (Finais) */}
        {roundsCenter.finals.length > 0 && (
          <div className="absolute top-0 bottom-0" style={{ left: getColX('center'), width: CENTER_W - 10 }}>
            <div className="text-xs font-semibold text-black text-center mb-2 sticky top-0 bg-gray-50 z-20 py-1"
                 style={{ marginTop: positions.get(roundsCenter.finals[0]?.slot) ? positions.get(roundsCenter.finals[0].slot)!.top - HEADER_H : 0 }}>
              Final
            </div>
            {roundsCenter.finals.map((m, i) => (
              <div key={m.slot}>
                {i === 1 && (() => {
                  const pos = positions.get(m.slot);
                  return pos ? (
                    <div className="absolute left-0 right-0 text-center text-xs font-semibold text-black"
                         style={{ top: pos.top - HEADER_H }}>
                      Disputa do 3º Colocado
                    </div>
                  ) : null;
                })()}
                {renderCard(m)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
