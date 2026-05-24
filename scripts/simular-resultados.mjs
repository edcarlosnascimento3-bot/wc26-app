import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeamento: ID atual -> { novo_nome, grupo_correto }
const renomearTimes = {
  // Grupo A
  "MEX": { name: "Brasil", group: "A" },
  "RSA": { name: "Marrocos", group: "A" },
  "KOR": { name: "Escócia", group: "A" },
  "CZE": { name: "Honduras", group: "A" },
  // Grupo B
  "CAN": { name: "Argentina", group: "B" },
  "BIH": { name: "França", group: "B" },
  "QAT": { name: "Nigéria", group: "B" },
  "SUI": { name: "Islândia", group: "B" },
  // Grupo C
  "BRA": { name: "Portugal", group: "C" },
  "MAR": { name: "Austrália", group: "C" },
  "SCO": { name: "Irã", group: "C" },
  "HAI": { name: "Gana", group: "C" },
  // Grupo D
  "USA": { name: "Inglaterra", group: "D" },
  "PAR": { name: "Espanha", group: "D" },
  "AUS": { name: "Jamaica", group: "D" },
  "TUR": { name: "Albânia", group: "D" },
  // Grupo E
  "GER": { name: "Alemanha", group: "E" },
  "CIV": { name: "Japão", group: "E" },
  "CUW": { name: "Turquia", group: "E" },
  "ECU": { name: "Coreia do Sul", group: "E" },
  // Grupo F
  "NED": { name: "Itália", group: "F" },
  "JPN": { name: "Bélgica", group: "F" },
  "SWE": { name: "Países Baixos", group: "F" },
  "TUN": { name: "Colômbia", group: "F" },
  // Grupo G
  "BEL": { name: "Uruguai", group: "G" },
  "EGY": { name: "Suécia", group: "G" },
  "IRN": { name: "Egito", group: "G" },
  "NZL": { name: "Hungria", group: "G" },
  // Grupo H
  "ESP": { name: "Croácia", group: "H" },
  "KSA": { name: "Dinamarca", group: "H" },
  "URU": { name: "Áustria", group: "H" },
  "CPV": { name: "Senegal", group: "H" },
  // Grupo I
  "FRA": { name: "Camarões", group: "I" },
  "SEN": { name: "Suíça", group: "I" },
  "IRQ": { name: "Estados Unidos", group: "I" },
  "NOR": { name: "Nova Zelândia", group: "I" },
  // Grupo J
  "ARG": { name: "México", group: "J" },
  "ALG": { name: "Paraguai", group: "J" },
  "AUT": { name: "Canadá", group: "J" },
  "JOR": { name: "Venezuela", group: "J" },
  // Grupo K
  "POR": { name: "Polônia", group: "K" },
  "COL": { name: "Chile", group: "K" },
  "COD": { name: "Irlanda", group: "K" },
  "UZB": { name: "Jordânia", group: "K" },
  // Grupo L
  "ENG": { name: "Ucrânia", group: "L" },
  "CRO": { name: "Bolívia", group: "L" },
  "GHA": { name: "Grécia", group: "L" },
  "PAN": { name: "Cabo Verde", group: "L" },
};

const resultados = [
  { g:"A",casa:"Brasil",vis:"Marrocos",h:3,a:1 },
  { g:"A",casa:"Escócia",vis:"Honduras",h:1,a:0 },
  { g:"A",casa:"Brasil",vis:"Escócia",h:2,a:0 },
  { g:"A",casa:"Marrocos",vis:"Honduras",h:2,a:1 },
  { g:"A",casa:"Brasil",vis:"Honduras",h:4,a:0 },
  { g:"A",casa:"Marrocos",vis:"Escócia",h:1,a:1 },
  { g:"B",casa:"Argentina",vis:"França",h:1,a:0 },
  { g:"B",casa:"Nigéria",vis:"Islândia",h:2,a:1 },
  { g:"B",casa:"Argentina",vis:"Nigéria",h:2,a:0 },
  { g:"B",casa:"França",vis:"Islândia",h:3,a:1 },
  { g:"B",casa:"Argentina",vis:"Islândia",h:1,a:1 },
  { g:"B",casa:"França",vis:"Nigéria",h:2,a:1 },
  { g:"C",casa:"Portugal",vis:"Austrália",h:3,a:0 },
  { g:"C",casa:"Irã",vis:"Gana",h:0,a:0 },
  { g:"C",casa:"Portugal",vis:"Irã",h:1,a:0 },
  { g:"C",casa:"Austrália",vis:"Gana",h:2,a:1 },
  { g:"C",casa:"Portugal",vis:"Austrália",h:2,a:2 },
  { g:"C",casa:"Irã",vis:"Gana",h:1,a:1 },
  { g:"D",casa:"Inglaterra",vis:"Espanha",h:2,a:1 },
  { g:"D",casa:"Jamaica",vis:"Albânia",h:1,a:0 },
  { g:"D",casa:"Inglaterra",vis:"Jamaica",h:1,a:1 },
  { g:"D",casa:"Espanha",vis:"Albânia",h:2,a:0 },
  { g:"D",casa:"Inglaterra",vis:"Albânia",h:3,a:0 },
  { g:"D",casa:"Espanha",vis:"Jamaica",h:1,a:0 },
  { g:"E",casa:"Alemanha",vis:"Japão",h:1,a:0 },
  { g:"E",casa:"Turquia",vis:"Coreia do Sul",h:1,a:0 },
  { g:"E",casa:"Alemanha",vis:"Turquia",h:2,a:1 },
  { g:"E",casa:"Japão",vis:"Coreia do Sul",h:2,a:1 },
  { g:"E",casa:"Alemanha",vis:"Coreia do Sul",h:0,a:0 },
  { g:"E",casa:"Japão",vis:"Turquia",h:1,a:1 },
  { g:"F",casa:"Itália",vis:"Bélgica",h:1,a:0 },
  { g:"F",casa:"Países Baixos",vis:"Colômbia",h:2,a:1 },
  { g:"F",casa:"Itália",vis:"Países Baixos",h:2,a:1 },
  { g:"F",casa:"Bélgica",vis:"Colômbia",h:1,a:1 },
  { g:"F",casa:"Itália",vis:"Colômbia",h:3,a:0 },
  { g:"F",casa:"Bélgica",vis:"Países Baixos",h:0,a:0 },
  { g:"G",casa:"Uruguai",vis:"Suécia",h:1,a:0 },
  { g:"G",casa:"Egito",vis:"Hungria",h:2,a:1 },
  { g:"G",casa:"Uruguai",vis:"Egito",h:0,a:0 },
  { g:"G",casa:"Suécia",vis:"Hungria",h:2,a:0 },
  { g:"G",casa:"Uruguai",vis:"Hungria",h:1,a:1 },
  { g:"G",casa:"Suécia",vis:"Egito",h:1,a:1 },
  { g:"H",casa:"Croácia",vis:"Dinamarca",h:1,a:1 },
  { g:"H",casa:"Áustria",vis:"Senegal",h:2,a:0 },
  { g:"H",casa:"Croácia",vis:"Áustria",h:2,a:1 },
  { g:"H",casa:"Dinamarca",vis:"Senegal",h:1,a:0 },
  { g:"H",casa:"Croácia",vis:"Senegal",h:1,a:0 },
  { g:"H",casa:"Dinamarca",vis:"Áustria",h:2,a:2 },
  { g:"I",casa:"Camarões",vis:"Suíça",h:3,a:1 },
  { g:"I",casa:"Estados Unidos",vis:"Nova Zelândia",h:1,a:0 },
  { g:"I",casa:"Camarões",vis:"Estados Unidos",h:1,a:0 },
  { g:"I",casa:"Suíça",vis:"Nova Zelândia",h:2,a:1 },
  { g:"I",casa:"Camarões",vis:"Nova Zelândia",h:2,a:0 },
  { g:"I",casa:"Suíça",vis:"Estados Unidos",h:0,a:1 },
  { g:"J",casa:"México",vis:"Paraguai",h:2,a:0 },
  { g:"J",casa:"Canadá",vis:"Venezuela",h:0,a:0 },
  { g:"J",casa:"México",vis:"Canadá",h:1,a:0 },
  { g:"J",casa:"Paraguai",vis:"Venezuela",h:2,a:1 },
  { g:"J",casa:"México",vis:"Venezuela",h:3,a:0 },
  { g:"J",casa:"Paraguai",vis:"Canadá",h:1,a:0 },
  { g:"K",casa:"Polônia",vis:"Chile",h:2,a:0 },
  { g:"K",casa:"Irlanda",vis:"Jordânia",h:1,a:0 },
  { g:"K",casa:"Polônia",vis:"Irlanda",h:1,a:1 },
  { g:"K",casa:"Chile",vis:"Jordânia",h:2,a:0 },
  { g:"K",casa:"Polônia",vis:"Jordânia",h:3,a:1 },
  { g:"K",casa:"Chile",vis:"Irlanda",h:0,a:0 },
  { g:"L",casa:"Ucrânia",vis:"Bolívia",h:1,a:0 },
  { g:"L",casa:"Grécia",vis:"Cabo Verde",h:2,a:1 },
  { g:"L",casa:"Ucrânia",vis:"Grécia",h:2,a:0 },
  { g:"L",casa:"Bolívia",vis:"Cabo Verde",h:0,a:0 },
  { g:"L",casa:"Ucrânia",vis:"Cabo Verde",h:3,a:1 },
  { g:"L",casa:"Grécia",vis:"Bolívia",h:1,a:1 },
];

async function main() {
  // 1. Renomear times
  console.log("Renomeando times...");
  for (const [id, data] of Object.entries(renomearTimes)) {
    const { error } = await supabase
      .from("teams")
      .update({ name: data.name, group_code: data.group })
      .eq("id", id);
    if (error) console.error(`Erro ao renomear ${id}:`, error);
    else console.log(`  ${id} -> ${data.name} (Grupo ${data.group})`);
  }

  // 2. Buscar times atualizados
  const { data: teams } = await supabase.from("teams").select("id,name,group_code");
  const teamByName = {};
  for (const t of teams) teamByName[t.name] = t;

  // 3. Buscar partidas
  const { data: matches } = await supabase
    .from("matches")
    .select("id,group_code,home_team_id,away_team_id")
    .eq("phase", "group");

  // 4. Aplicar resultados
  console.log("\nAplicando resultados...");
  let ok = 0, err = 0;

  for (const r of resultados) {
    const homeTeam = teamByName[r.casa];
    const awayTeam = teamByName[r.vis];
    if (!homeTeam) { console.error(`Time não encontrado: ${r.casa}`); err++; continue; }
    if (!awayTeam) { console.error(`Time não encontrado: ${r.vis}`); err++; continue; }

    const match = matches.find(m =>
      m.group_code === r.g && m.home_team_id === homeTeam.id && m.away_team_id === awayTeam.id
    );

    if (!match) {
      // Tenta invertido
      const rev = matches.find(m =>
        m.group_code === r.g && m.home_team_id === awayTeam.id && m.away_team_id === homeTeam.id
      );
      if (rev) {
        await supabase.from("matches").update({ real_home: r.a, real_away: r.h }).eq("id", rev.id);
        console.log(`  ${rev.id}: ${r.vis} ${r.a}x${r.h} ${r.casa}`);
        ok++;
      } else {
        console.error(`Partida não encontrada: ${r.casa} vs ${r.vis} (${r.g})`);
        err++;
      }
      continue;
    }

    await supabase.from("matches").update({ real_home: r.h, real_away: r.a }).eq("id", match.id);
    console.log(`  ${match.id}: ${r.casa} ${r.h}x${r.a} ${r.vis}`);
    ok++;
  }

  console.log(`\nConcluído! ${ok} partidas atualizadas, ${err} erros.`);
}

main();
