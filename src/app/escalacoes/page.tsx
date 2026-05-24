import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

const GROUPS = "ABCDEFGHIJKL".split("");

export default async function EscalacoesPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: teams } = await supabase.from("teams").select("*").order("group_code").order("id");

  const teamsByGroup = new Map<string, typeof teams>();
  for (const g of GROUPS) teamsByGroup.set(g, []);
  for (const t of teams ?? []) {
    if (t.group_code) teamsByGroup.get(t.group_code)?.push(t);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Escalações</h1>
      <p className="text-sm opacity-70">Selecione uma seleção para ver sua escalação completa</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GROUPS.map(g => {
          const groupTeams = teamsByGroup.get(g) ?? [];
          return (
            <div key={g} className="rounded-xl border bg-white p-4 space-y-2">
              <h2 className="font-bold text-lg">Grupo {g}</h2>
              <div className="space-y-1">
                {groupTeams.map(t => (
                  <Link
                    key={t.id}
                    href={`/escalacoes/${t.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    {t.flag_url && (
                      <img src={t.flag_url} alt="" className="w-6 h-4 object-cover rounded shadow-sm" />
                    )}
                    <span className="text-sm">{t.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
