import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [teamR, playersR] = await Promise.all([
    supabase.from("teams").select("*").eq("id", id).single(),
    supabase.from("players").select("*").eq("team_id", id).order("position").order("shirt_number"),
  ]);

  const team = teamR.data;
  if (!team) notFound();

  const players = playersR.data ?? [];

  const grouped: Record<string, typeof players> = {};
  const POS_LABELS: Record<string, string> = {
    GK: "Goleiros", DF: "Defensores", MF: "Meio-campistas", FW: "Atacantes",
  };
  for (const p of players) {
    if (!grouped[p.position]) grouped[p.position] = [];
    grouped[p.position].push(p);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/escalacoes" className="text-sm opacity-60 hover:opacity-100">&larr; Todas as seleções</Link>

      <div className="flex items-center gap-4">
        {team.flag_url && (
          <img src={team.flag_url} alt="" className="w-12 h-8 object-cover rounded shadow-sm" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-sm opacity-60">Grupo {team.group_code} &middot; {players.length} jogadores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {["GK", "DF", "MF", "FW"].map(pos => {
          const list = grouped[pos] ?? [];
          if (list.length === 0) return null;
          return (
            <div key={pos} className="rounded-xl border bg-white p-5 space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider opacity-70">{POS_LABELS[pos]} <span className="font-normal opacity-40">({list.length})</span></h2>
              {list.map(p => (
                <div key={p.id} className="flex items-center gap-3 text-sm py-1">
                  <span className="w-6 text-center font-mono text-xs font-bold opacity-40 bg-gray-100 rounded">{p.shirt_number}</span>
                  <span className="truncate font-medium">{p.name}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
