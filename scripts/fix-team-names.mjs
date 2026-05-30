import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Real team codes → correct Portuguese name and group
const realTeams = {
  "MEX": { name: "México", group: "A" },
  "KOR": { name: "Coreia do Sul", group: "A" },
  "RSA": { name: "África do Sul", group: "A" },
  "CZE": { name: "Tchéquia", group: "A" },
  "CAN": { name: "Canadá", group: "B" },
  "QAT": { name: "Catar", group: "B" },
  "SUI": { name: "Suíça", group: "B" },
  "BIH": { name: "Bósnia e Herzegovina", group: "B" },
  "BRA": { name: "Brasil", group: "C" },
  "MAR": { name: "Marrocos", group: "C" },
  "SCO": { name: "Escócia", group: "C" },
  "HAI": { name: "Haiti", group: "C" },
  "USA": { name: "Estados Unidos", group: "D" },
  "PAR": { name: "Paraguai", group: "D" },
  "AUS": { name: "Austrália", group: "D" },
  "TUR": { name: "Turquia", group: "D" },
  "GER": { name: "Alemanha", group: "E" },
  "CIV": { name: "Costa do Marfim", group: "E" },
  "CUW": { name: "Curaçao", group: "E" },
  "ECU": { name: "Equador", group: "E" },
  "NED": { name: "Holanda", group: "F" },
  "JPN": { name: "Japão", group: "F" },
  "SWE": { name: "Suécia", group: "F" },
  "TUN": { name: "Tunísia", group: "F" },
  "BEL": { name: "Bélgica", group: "G" },
  "IRN": { name: "Irã", group: "G" },
  "EGY": { name: "Egito", group: "G" },
  "NZL": { name: "Nova Zelândia", group: "G" },
  "ESP": { name: "Espanha", group: "H" },
  "KSA": { name: "Arábia Saudita", group: "H" },
  "URY": { name: "Uruguai", group: "H" },
  "CPV": { name: "Cabo Verde", group: "H" },
  "FRA": { name: "França", group: "I" },
  "SEN": { name: "Senegal", group: "I" },
  "IRQ": { name: "Iraque", group: "I" },
  "NOR": { name: "Noruega", group: "I" },
  "ARG": { name: "Argentina", group: "J" },
  "AUT": { name: "Áustria", group: "J" },
  "DZA": { name: "Argélia", group: "J" },
  "JOR": { name: "Jordânia", group: "J" },
  "POR": { name: "Portugal", group: "K" },
  "COD": { name: "RD Congo", group: "K" },
  "UZB": { name: "Uzbequistão", group: "K" },
  "COL": { name: "Colômbia", group: "K" },
  "ENG": { name: "Inglaterra", group: "L" },
  "CRO": { name: "Croácia", group: "L" },
  "GHA": { name: "Gana", group: "L" },
  "PAN": { name: "Panamá", group: "L" },
};

const flagMap = {
  "México": "mx",
  "Coreia do Sul": "kr",
  "África do Sul": "za",
  "Tchéquia": "cz",
  "Canadá": "ca",
  "Catar": "qa",
  "Suíça": "ch",
  "Bósnia e Herzegovina": "ba",
  "Brasil": "br",
  "Marrocos": "ma",
  "Escócia": "gb-sct",
  "Haiti": "ht",
  "Estados Unidos": "us",
  "Paraguai": "py",
  "Austrália": "au",
  "Turquia": "tr",
  "Alemanha": "de",
  "Costa do Marfim": "ci",
  "Curaçao": "cw",
  "Equador": "ec",
  "Holanda": "nl",
  "Japão": "jp",
  "Suécia": "se",
  "Tunísia": "tn",
  "Bélgica": "be",
  "Irã": "ir",
  "Egito": "eg",
  "Nova Zelândia": "nz",
  "Espanha": "es",
  "Arábia Saudita": "sa",
  "Uruguai": "uy",
  "Cabo Verde": "cv",
  "França": "fr",
  "Senegal": "sn",
  "Iraque": "iq",
  "Noruega": "no",
  "Argentina": "ar",
  "Áustria": "at",
  "Argélia": "dz",
  "Jordânia": "jo",
  "Portugal": "pt",
  "RD Congo": "cd",
  "Uzbequistão": "uz",
  "Colômbia": "co",
  "Inglaterra": "gb-eng",
  "Croácia": "hr",
  "Gana": "gh",
  "Panamá": "pa",
};

// Our DB has URU (not URY) — handle that
const dbCodeMap = { "URY": "URU" };

let updated = 0;
let notFound = 0;

for (const [code, info] of Object.entries(realTeams)) {
  const dbCode = dbCodeMap[code] || code;

  const { data: existing } = await supabase
    .from("teams")
    .select("id")
    .eq("id", dbCode)
    .maybeSingle();

  if (!existing) {
    console.warn(`  ⚠ Time não encontrado no DB: ${code} (${info.name})`);
    notFound++;
    continue;
  }

  const flagUrl = `https://flagcdn.com/w320/${flagMap[info.name] || "xx"}.png`;
  const { error } = await supabase
    .from("teams")
    .update({ name: info.name, group_code: info.group, flag_url: flagUrl, code: code })
    .eq("id", dbCode);

  if (error) {
    console.error(`Erro ao atualizar ${code}: ${error.message}`);
  } else {
    console.log(`  ${code} → ${info.name} (Grupo ${info.group})`);
    updated++;
  }
}

// Handle URU separately (our DB has URU not URY)
const uru = realTeams["URY"];
if (uru) {
  const uruFlag = `https://flagcdn.com/w320/${flagMap["Uruguai"]}.png`;
  await supabase.from("teams")
    .update({ name: uru.name, group_code: uru.group, flag_url: uruFlag, code: "URY" })
    .eq("id", "URU");
}

// Handle ALG (our DB) separately — corresponds to DZA (Argélia)
const algInfo = realTeams["DZA"];
if (algInfo) {
  const algFlag = `https://flagcdn.com/w320/${flagMap["Argélia"]}.png`;
  await supabase.from("teams")
    .update({ name: algInfo.name, group_code: algInfo.group, flag_url: algFlag, code: "DZA" })
    .eq("id", "ALG");
}

// Delete teams that are not real WC 2026 teams
const fakeIds = ["URU", "ALG"]; // already handled above, now check remaining fakes
const { data: allTeams } = await supabase.from("teams").select("id, name");
const realIds = new Set(Object.values(realTeams).map(v => v.name));
const realCodes = new Set([...Object.keys(realTeams), "URU", "ALG"]);

console.log(`\n${updated} times atualizados, ${notFound} não encontrados`);
console.log("Faltam deletar times que não são da Copa 2026? Verifique manualmente.");
