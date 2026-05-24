"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Team = { id: string; name: string; flag_url: string | null };

export default function MeusCampeoesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [picks, setPicks] = useState<(string | null)[]>([null, null, null]);
  const [savedPicks, setSavedPicks] = useState<(string | null)[]>([null, null, null]);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [firstKickoff, setFirstKickoff] = useState(Infinity);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const [teamsR, picksR, matchesR] = await Promise.all([
        supabase.from("teams").select("id,name,flag_url").order("group_code").order("id"),
        fetch("/api/champion-pick").then(r => r.json()),
        supabase.from("matches").select("kickoff_utc").order("kickoff_utc").limit(1).single(),
      ]);

      setTeams(teamsR.data ?? []);
      if (matchesR.data?.kickoff_utc) {
        setFirstKickoff(new Date(matchesR.data.kickoff_utc).getTime());
      }
      if (picksR.picks) {
        const p: (string | null)[] = [null, null, null];
        picksR.picks.slice(0, 3).forEach((t: string, i: number) => { p[i] = t; });
        setPicks(p);
        setSavedPicks([...p]);
      }
    })();
  }, []);

  const encerrado = now >= firstKickoff - 30 * 60 * 1000;
  const hasSaved = savedPicks.some(Boolean) && picks.every((v, i) => v === savedPicks[i]);

  const changePick = (slot: number, teamId: string) => {
    const next = [...picks];

    if (teamId === "") {
      next[slot] = null;
    } else {
      for (let i = 0; i < 3; i++) {
        if (i !== slot && picks[i] === teamId) {
          next[i] = null;
        }
      }
      next[slot] = teamId;
    }
    setPicks(next);
  };

  const save = async () => {
    setSaving(true);
    const r = await fetch("/api/champion-pick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ picks: picks.filter(Boolean) }),
    });
    if (r.ok) setSavedPicks([...picks]);
    setSaving(false);
  };

  const available = (exclude: string[]) =>
    teams.filter(t => !exclude.includes(t.id)).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Meus Campeões</h1>
      <p className="text-sm opacity-70 whitespace-nowrap">Escolha 3 seleções na ordem que você acredita que pode ser a campeã da Copa do Mundo de 2026</p>

      <div className="space-y-3">
        {[
          { label: "1º Lugar (Campeão)", pos: 0 },
          { label: "2º Lugar (Vice)", pos: 1 },
          { label: "3º Lugar", pos: 2 },
        ].map(({ label, pos }) => {
          const current = picks[pos];
          const team = teams.find(t => t.id === current);
          const exclude = picks.filter((_, i) => i !== pos).filter(Boolean) as string[];
          const options = available(exclude);
          return (
            <div key={pos} className="rounded-xl border bg-white p-4 space-y-3">
              <label className="text-sm font-semibold">{label}</label>
              <select
                value={current ?? ""}
                onChange={e => changePick(pos, e.target.value)}
                disabled={encerrado}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">— Selecione —</option>
                {options.map(t => (
                  <option key={t.id} value={t.id}>[{t.id}] {t.name}</option>
                ))}
              </select>
              {team && (
                <div className="flex items-center gap-4 pt-2">
                  {team.flag_url && (
                    <img src={team.flag_url} alt="" className="w-16 h-12 object-cover rounded shadow-md" />
                  )}
                  <span className="text-lg font-bold">{team.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={save}
        disabled={saving || encerrado || picks.filter(Boolean).length === 0}
        className={`w-full rounded-xl py-3 font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
          encerrado
            ? "bg-red-700 text-white"
            : hasSaved
              ? "bg-green-800 text-white hover:bg-green-700"
              : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {saving ? "Salvando..." : encerrado ? "Encerrado" : hasSaved ? "Salvo" : "Salvar escolhas"}
      </button>

      <p className="text-sm font-bold text-black text-center">
        Você pode escolher e trocar as suas seleções preferidas até 30 minutos antes do início da Copa do Mundo 2026
      </p>
    </div>
  );
}
