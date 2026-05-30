import Link from "next/link";
export const dynamic = "force-dynamic";

const features = [
  { label: "Grupos", href: "/grupos", desc: "Tabela dos 12 grupos com classificação em tempo real" },
  { label: "Palpites", href: "/palpite", desc: "Faça seus palpites nos jogos da fase de grupos" },
  { label: "Fase de Grupos", href: "/partidas", desc: "Jogos do dia com placar manual e real" },
  { label: "Classificação", href: "/classificacao", desc: "Ranking completo dos grupos e melhores 3º" },
  { label: "Estádios", href: "/estadios", desc: "Todos os estádios da Copa 2026" },
  { label: "Escalações", href: "/escalacoes", desc: "Escalações das 48 seleções do torneio" },
  { label: "Meus Campeões", href: "/meus-campeoes", desc: "Escolha suas 3 seleções favoritas ao título" },
  { label: "Pontuação", href: "/pontuacao", desc: "Ranking de pontos dos usuários" },
  { label: "Artilharia", href: "/artilharia", desc: "Artilheiros do torneio" },
  { label: "Chaveamento", href: "/chaveamento", desc: "Mata-mata completo até a final" },
];

const gradients = [
  "from-emerald-500 to-teal-500",
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-sky-500 to-indigo-500",
  "from-lime-500 to-green-500",
  "from-fuchsia-500 to-pink-600",
  "from-red-500 to-rose-600",
  "from-teal-500 to-cyan-600",
];

export default function HomePage() {
  return (
    <div className="space-y-8 relative">
      <div className="fixed inset-0 -z-10 opacity-70 bg-[url('/escudo-copa.png')] bg-cover bg-center bg-no-repeat" />
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold">Copa do Mundo 2026</h1>
        <p className="text-lg opacity-70 mt-2">Tabela interativa — Canadá, México e EUA</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <Link
            key={f.href}
            href={f.href}
            className="group rounded-xl border bg-white p-6 space-y-2 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200 relative overflow-hidden"
          >
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradients[i % gradients.length]}`} />
            <h2 className="text-xl font-semibold">{f.label}</h2>
            <p className="text-sm opacity-70">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
