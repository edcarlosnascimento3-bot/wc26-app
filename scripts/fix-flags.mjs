import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ISO alpha-2 flag codes for each team name
const flagMap = {
  "Brasil": "br",
  "Marrocos": "ma",
  "Escócia": "gb-sct",
  "Honduras": "hn",
  "Argentina": "ar",
  "França": "fr",
  "Nigéria": "ng",
  "Islândia": "is",
  "Portugal": "pt",
  "Austrália": "au",
  "Irã": "ir",
  "Gana": "gh",
  "Inglaterra": "gb-eng",
  "Espanha": "es",
  "Jamaica": "jm",
  "Albânia": "al",
  "Alemanha": "de",
  "Japão": "jp",
  "Turquia": "tr",
  "Coreia do Sul": "kr",
  "Itália": "it",
  "Bélgica": "be",
  "Países Baixos": "nl",
  "Colômbia": "co",
  "Uruguai": "uy",
  "Suécia": "se",
  "Egito": "eg",
  "Hungria": "hu",
  "Croácia": "hr",
  "Dinamarca": "dk",
  "Áustria": "at",
  "Senegal": "sn",
  "Camarões": "cm",
  "Suíça": "ch",
  "Estados Unidos": "us",
  "Nova Zelândia": "nz",
  "México": "mx",
  "Paraguai": "py",
  "Canadá": "ca",
  "Venezuela": "ve",
  "Polônia": "pl",
  "Chile": "cl",
  "Irlanda": "ie",
  "Jordânia": "jo",
  "Ucrânia": "ua",
  "Bolívia": "bo",
  "Grécia": "gr",
  "Cabo Verde": "cv",
};

const { data: teams, error: fetchErr } = await supabase
  .from("teams")
  .select("id, name, flag_url");

if (fetchErr) {
  console.error("Erro ao buscar times:", fetchErr.message);
  process.exit(1);
}

let ok = 0;
for (const team of teams) {
  const code = flagMap[team.name];
  if (!code) {
    console.warn(`  ⚠ Nenhum código encontrado para "${team.name}" (ID: ${team.id})`);
    continue;
  }
  const correctUrl = `https://flagcdn.com/w320/${code}.png`;
  if (team.flag_url !== correctUrl) {
    const { error: updErr } = await supabase
      .from("teams")
      .update({ flag_url: correctUrl })
      .eq("id", team.id);
    if (updErr) {
      console.error(`  Erro ao atualizar ${team.name}: ${updErr.message}`);
    } else {
      console.log(`  ${team.name} → bandeira corrigida`);
      ok++;
    }
  }
}

console.log(`\n${ok} bandeiras corrigidas.`);
