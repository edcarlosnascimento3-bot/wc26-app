import Link from "next/link";

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

export default function HomePage() {
  return (
    <div className="space-y-8 relative">
      <div className="fixed inset-0 -z-10 opacity-70 bg-[url('/escudo-copa.png')] bg-cover bg-center bg-no-repeat" />
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold">Copa do Mundo 2026</h1>
        <p className="text-lg opacity-70 mt-2">Tabela interativa — Canadá, México e EUA</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="rounded-xl border bg-white p-6 hover:shadow-md transition-shadow space-y-2"
          >
            <h2 className="text-xl font-semibold">{f.label}</h2>
            <p className="text-sm opacity-70">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
