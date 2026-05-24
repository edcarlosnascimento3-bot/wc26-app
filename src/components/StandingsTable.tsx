export function StandingsTable({
  rows, teamsMap,
}: {
  rows: any[];
  teamsMap?: Map<string, { name: string; flag_url: string | null }>;
}) {
  const map = teamsMap ?? new Map();
  return (
    <div className="rounded-xl border p-3 bg-white overflow-x-auto">
      <div className="grid grid-cols-10 text-xs font-semibold opacity-70 pb-2 border-b mb-2 min-w-[500px]">
        <div className="col-span-2">Time</div>
        <div className="text-center">Pts</div>
        <div className="text-center">P</div>
        <div className="text-center">V</div>
        <div className="text-center">E</div>
        <div className="text-center">D</div>
        <div className="text-center">GM</div>
        <div className="text-center">GS</div>
        <div className="text-center">SG</div>
      </div>
      <div className="space-y-1 text-sm min-w-[500px]">
        {rows.map((r, i) => {
          const t = map.get(r.teamId);
          return (
            <div key={r.teamId} className="grid grid-cols-10 items-center py-1">
              <div className="col-span-2 font-medium flex items-center gap-2 truncate">
                {t?.flag_url && (
                  <img src={t.flag_url} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm flex-shrink-0" />
                )}
                <span className="truncate">{t?.name ?? r.teamId}</span>
              </div>
              <div className="text-center font-semibold">{r.pts}</div>
              <div className="text-center">{r.P}</div>
              <div className="text-center">{r.W}</div>
              <div className="text-center">{r.D}</div>
              <div className="text-center">{r.L}</div>
              <div className="text-center">{r.GF}</div>
              <div className="text-center">{r.GA}</div>
              <div className="text-center">{r.GD}</div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="text-sm opacity-50 italic py-2">Nenhum dado disponível</div>
        )}
      </div>
    </div>
  );
}
