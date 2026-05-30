import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Real 72 group matches from the external schedule API
// Each entry: { homeCode, awayCode, datetime_utc, venueCode, groupCode }
const realMatches = [
  // Group A: MEX→Brasil, KOR→Escócia, CZE→Honduras, RSA→Marrocos
  // But real Group A is México, Coreia do Sul, África do Sul, Tchéquia — different teams.
  // Our renamed teams don't map cleanly, so we map by match_number order
  // and update home/away to reflect real pairings for renamed teams.

  // RODADA 1
  // 1. México × África do Sul → MEX (México→?) vs RSA (África do Sul→?)
  //    Neither maps to our renamed teams. Skip — keep existing but fix date.
  { homeCode: "MEX", awayCode: "RSA", datetime_utc: "2026-06-11T19:00:00Z", venueCode: "estadio-azteca", groupCode: "A" },
  // 2. Coreia do Sul × Tchéquia → KOR (Escócia→?) vs CZE (Honduras→?)
  { homeCode: "KOR", awayCode: "CZE", datetime_utc: "2026-06-12T02:00:00Z", venueCode: "estadio-akron", groupCode: "A" },
  // 3. Canadá × Bósnia → CAN (Argentina) vs BIH (França)
  { homeCode: "CAN", awayCode: "BIH", datetime_utc: "2026-06-12T19:00:00Z", venueCode: "bmo-field", groupCode: "B" },
  // 4. EUA × Paraguai → USA (Inglaterra) vs PAR (Espanha)
  { homeCode: "USA", awayCode: "PAR", datetime_utc: "2026-06-13T01:00:00Z", venueCode: "sofistadium", groupCode: "D" },
  // 5. Catar × Suíça → QAT (Nigéria→?) vs SUI (Islândia→?)
  { homeCode: "QAT", awayCode: "SUI", datetime_utc: "2026-06-13T19:00:00Z", venueCode: "mercedes-benz", groupCode: "B" },
  // 6. Brasil × Marrocos → BRA (Portugal) vs MAR (Austrália)
  { homeCode: "BRA", awayCode: "MAR", datetime_utc: "2026-06-13T22:00:00Z", venueCode: "nrg", groupCode: "C" },
  // 7. Haiti × Escócia → HAI (Gana) vs SCO (Irã)
  { homeCode: "HAI", awayCode: "SCO", datetime_utc: "2026-06-14T01:00:00Z", venueCode: "lincoln", groupCode: "C" },
  // 8. Austrália × Turquia → AUS (Jamaica→?) vs TUR (Albânia→?)
  { homeCode: "AUS", awayCode: "TUR", datetime_utc: "2026-06-14T04:00:00Z", venueCode: "lumen", groupCode: "D" },
  // 9. Alemanha × Curaçao → GER (Alemanha) vs CUW (Turquia)
  //    Real: GER (Alemanha→Alemanha✓) × CUW (Turquia) → ✓
  { homeCode: "GER", awayCode: "CUW", datetime_utc: "2026-06-14T17:00:00Z", venueCode: "levis", groupCode: "E" },
  // 10. Holanda × Japão → NED (Itália→?) vs JPN (Bélgica)
  { homeCode: "NED", awayCode: "JPN", datetime_utc: "2026-06-14T20:00:00Z", venueCode: "arrowhead", groupCode: "F" },
  // 11. Costa do Marfim × Equador → CIV (Japão) vs ECU (Coreia do Sul)
  { homeCode: "CIV", awayCode: "ECU", datetime_utc: "2026-06-14T23:00:00Z", venueCode: "gillette", groupCode: "E" },
  // 12. Suécia × Tunísia → SWE (Países Baixos) vs TUN (Colômbia)
  { homeCode: "SWE", awayCode: "TUN", datetime_utc: "2026-06-15T02:00:00Z", venueCode: "hard-rock", groupCode: "F" },

  // RODADA 2
  // 13. Espanha × Cabo Verde → ESP (Croácia) vs CPV (Senegal)
  { homeCode: "ESP", awayCode: "CPV", datetime_utc: "2026-06-15T16:00:00Z", venueCode: "estadio-akron", groupCode: "H" },
  // 14. Bélgica × Egito → BEL (Uruguai) vs EGY (Suécia)
  { homeCode: "BEL", awayCode: "EGY", datetime_utc: "2026-06-15T19:00:00Z", venueCode: "estadio-bbva", groupCode: "G" },
  // 15. Arábia Saudita × Uruguai → KSA (Dinamarca→?) vs URU (Áustria)
  //    URU→Áustria, real Uruguai is URY code, but our DB has URU (now Áustria)
  { homeCode: "KSA", awayCode: "URY", datetime_utc: "2026-06-15T22:00:00Z", venueCode: "bmo-field", groupCode: "H" },
  // 16. Irã × Nova Zelândia → IRN (Egito) vs NZL (Hungria→?)
  { homeCode: "IRN", awayCode: "NZL", datetime_utc: "2026-06-16T01:00:00Z", venueCode: "bc-place", groupCode: "G" },
  // 17. França × Senegal → FRA (Camarões→?) vs SEN (Suíça)
  { homeCode: "FRA", awayCode: "SEN", datetime_utc: "2026-06-16T19:00:00Z", venueCode: "metlife", groupCode: "I" },
  // 18. Iraque × Noruega → IRQ (Estados Unidos) vs NOR (Nova Zelândia)
  { homeCode: "IRQ", awayCode: "NOR", datetime_utc: "2026-06-16T22:00:00Z", venueCode: "sofistadium", groupCode: "I" },
  // 19. Argentina × Argélia → ARG (México) vs ALG (Paraguai)
  //    Real: ARG (México) vs DZA (Argélia→?) — DZA not in our DB
  { homeCode: "ARG", awayCode: "DZA", datetime_utc: "2026-06-17T01:00:00Z", venueCode: "att-stadium", groupCode: "J" },
  // 20. Áustria × Jordânia → AUT (Canadá) vs JOR (Venezuela→?)
  { homeCode: "AUT", awayCode: "JOR", datetime_utc: "2026-06-17T04:00:00Z", venueCode: "hard-rock", groupCode: "J" },
  // 21. Portugal × RD Congo → POR (Polônia→?) vs COD (Irlanda→?)
  { homeCode: "POR", awayCode: "COD", datetime_utc: "2026-06-17T17:00:00Z", venueCode: "mercedes-benz", groupCode: "K" },
  // 22. Inglaterra × Croácia → ENG (Ucrânia→?) vs CRO (Bolívia→?)
  { homeCode: "ENG", awayCode: "CRO", datetime_utc: "2026-06-17T20:00:00Z", venueCode: "nrg", groupCode: "L" },
  // 23. Gana × Panamá → GHA (Grécia→?) vs PAN (Cabo Verde)
  { homeCode: "GHA", awayCode: "PAN", datetime_utc: "2026-06-17T23:00:00Z", venueCode: "lincoln", groupCode: "L" },
  // 24. Uzbequistão × Colômbia → UZB (Jordânia) vs COL (Chile→?)
  { homeCode: "UZB", awayCode: "COL", datetime_utc: "2026-06-18T02:00:00Z", venueCode: "lumen", groupCode: "K" },

  // RODADA 3
  // 25. Tchéquia × África do Sul → CZE (Honduras) vs RSA (Marrocos)
  { homeCode: "CZE", awayCode: "RSA", datetime_utc: "2026-06-18T16:00:00Z", venueCode: "levis", groupCode: "A" },
  // 26. Suíça × Bósnia → SUI (Islândia→?) vs BIH (França)
  { homeCode: "SUI", awayCode: "BIH", datetime_utc: "2026-06-18T19:00:00Z", venueCode: "arrowhead", groupCode: "B" },
  // 27. Canadá × Catar → CAN (Argentina) vs QAT (Nigéria→?)
  { homeCode: "CAN", awayCode: "QAT", datetime_utc: "2026-06-18T22:00:00Z", venueCode: "gillette", groupCode: "B" },
  // 28. México × Coreia do Sul → MEX (Brasil) vs KOR (Escócia)
  { homeCode: "MEX", awayCode: "KOR", datetime_utc: "2026-06-19T01:00:00Z", venueCode: "estadio-azteca", groupCode: "A" },
  // 29. EUA × Austrália → USA (Inglaterra) vs AUS (Jamaica→?)
  { homeCode: "USA", awayCode: "AUS", datetime_utc: "2026-06-19T19:00:00Z", venueCode: "estadio-akron", groupCode: "D" },
  // 30. Escócia × Marrocos → SCO (Irã) vs MAR (Austrália)
  { homeCode: "SCO", awayCode: "MAR", datetime_utc: "2026-06-19T22:00:00Z", venueCode: "estadio-bbva", groupCode: "C" },
  // 31. Brasil × Haiti → BRA (Portugal) vs HAI (Gana)
  { homeCode: "BRA", awayCode: "HAI", datetime_utc: "2026-06-20T00:30:00Z", venueCode: "bmo-field", groupCode: "C" },
  // 32. Turquia × Paraguai → TUR (Albânia→?) vs PAR (Espanha)
  { homeCode: "TUR", awayCode: "PAR", datetime_utc: "2026-06-20T03:00:00Z", venueCode: "bc-place", groupCode: "D" },
  // 33. Holanda × Suécia → NED (Itália→?) vs SWE (Países Baixos)
  { homeCode: "NED", awayCode: "SWE", datetime_utc: "2026-06-20T17:00:00Z", venueCode: "metlife", groupCode: "F" },
  // 34. Alemanha × Costa do Marfim → GER (Alemanha) vs CIV (Japão)
  { homeCode: "GER", awayCode: "CIV", datetime_utc: "2026-06-20T20:00:00Z", venueCode: "sofistadium", groupCode: "E" },
  // 35. Equador × Curaçao → ECU (Coreia do Sul) vs CUW (Turquia)
  { homeCode: "ECU", awayCode: "CUW", datetime_utc: "2026-06-21T00:00:00Z", venueCode: "att-stadium", groupCode: "E" },
  // 36. Tunísia × Japão → TUN (Colômbia) vs JPN (Bélgica)
  { homeCode: "TUN", awayCode: "JPN", datetime_utc: "2026-06-21T04:00:00Z", venueCode: "hard-rock", groupCode: "F" },

  // RODADA 4
  // 37. Espanha × Arábia Saudita → ESP (Croácia) vs KSA (Dinamarca→?)
  { homeCode: "ESP", awayCode: "KSA", datetime_utc: "2026-06-21T16:00:00Z", venueCode: "mercedes-benz", groupCode: "H" },
  // 38. Bélgica × Irã → BEL (Uruguai) vs IRN (Egito)
  { homeCode: "BEL", awayCode: "IRN", datetime_utc: "2026-06-21T19:00:00Z", venueCode: "nrg", groupCode: "G" },
  // 39. Uruguai × Cabo Verde → URU (Áustria) vs CPV (Senegal)
  //    Real Uruguai = URY code; our DB URU = Áustria
  { homeCode: "URY", awayCode: "CPV", datetime_utc: "2026-06-21T22:00:00Z", venueCode: "lincoln", groupCode: "H" },
  // 40. Nova Zelândia × Egito → NZL (Hungria→?) vs EGY (Suécia)
  { homeCode: "NZL", awayCode: "EGY", datetime_utc: "2026-06-22T01:00:00Z", venueCode: "lumen", groupCode: "G" },
  // 41. Argentina × Áustria → ARG (México) vs AUT (Canadá)
  { homeCode: "ARG", awayCode: "AUT", datetime_utc: "2026-06-22T17:00:00Z", venueCode: "levis", groupCode: "J" },
  // 42. França × Iraque → FRA (Camarões→?) vs IRQ (Estados Unidos)
  { homeCode: "FRA", awayCode: "IRQ", datetime_utc: "2026-06-22T21:00:00Z", venueCode: "arrowhead", groupCode: "I" },
  // 43. Noruega × Senegal → NOR (Nova Zelândia) vs SEN (Suíça)
  { homeCode: "NOR", awayCode: "SEN", datetime_utc: "2026-06-23T00:00:00Z", venueCode: "gillette", groupCode: "I" },
  // 44. Jordânia × Argélia → JOR (Venezuela→?) vs ALG (Paraguai)
  //    Real: JOR (Jordânia) vs DZA (Argélia) — DZA not in our DB
  { homeCode: "JOR", awayCode: "DZA", datetime_utc: "2026-06-23T03:00:00Z", venueCode: "estadio-azteca", groupCode: "J" },
  // 45. Portugal × Uzbequistão → POR (Polônia→?) vs UZB (Jordânia)
  { homeCode: "POR", awayCode: "UZB", datetime_utc: "2026-06-23T17:00:00Z", venueCode: "estadio-akron", groupCode: "K" },
  // 46. Inglaterra × Gana → ENG (Ucrânia→?) vs GHA (Grécia→?)
  { homeCode: "ENG", awayCode: "GHA", datetime_utc: "2026-06-23T20:00:00Z", venueCode: "estadio-bbva", groupCode: "L" },
  // 47. Panamá × Croácia → PAN (Cabo Verde) vs CRO (Bolívia→?)
  { homeCode: "PAN", awayCode: "CRO", datetime_utc: "2026-06-23T23:00:00Z", venueCode: "bmo-field", groupCode: "L" },
  // 48. Colômbia × RD Congo → COL (Chile→?) vs COD (Irlanda→?)
  { homeCode: "COL", awayCode: "COD", datetime_utc: "2026-06-24T02:00:00Z", venueCode: "bc-place", groupCode: "K" },

  // RODADA 5
  // 49. Suíça × Canadá → SUI (Islândia→?) vs CAN (Argentina)
  { homeCode: "SUI", awayCode: "CAN", datetime_utc: "2026-06-24T19:00:00Z", venueCode: "metlife", groupCode: "B" },
  // 50. Bósnia × Catar → BIH (França) vs QAT (Nigéria→?)
  { homeCode: "BIH", awayCode: "QAT", datetime_utc: "2026-06-24T19:00:00Z", venueCode: "sofistadium", groupCode: "B" },
  // 51. Marrocos × Haiti → MAR (Austrália) vs HAI (Gana)
  { homeCode: "MAR", awayCode: "HAI", datetime_utc: "2026-06-24T22:00:00Z", venueCode: "att-stadium", groupCode: "C" },
  // 52. Escócia × Brasil → SCO (Irã) vs BRA (Portugal)
  { homeCode: "SCO", awayCode: "BRA", datetime_utc: "2026-06-24T22:00:00Z", venueCode: "hard-rock", groupCode: "C" },
  // 53. Tchéquia × México → CZE (Honduras) vs MEX (Brasil)
  { homeCode: "CZE", awayCode: "MEX", datetime_utc: "2026-06-25T01:00:00Z", venueCode: "mercedes-benz", groupCode: "A" },
  // 54. África do Sul × Coreia do Sul → RSA (Marrocos) vs KOR (Escócia)
  { homeCode: "RSA", awayCode: "KOR", datetime_utc: "2026-06-25T01:00:00Z", venueCode: "nrg", groupCode: "A" },
  // 55. Equador × Alemanha → ECU (Coreia do Sul) vs GER (Alemanha)
  { homeCode: "ECU", awayCode: "GER", datetime_utc: "2026-06-25T20:00:00Z", venueCode: "lincoln", groupCode: "E" },
  // 56. Curaçao × Costa do Marfim → CUW (Turquia) vs CIV (Japão)
  { homeCode: "CUW", awayCode: "CIV", datetime_utc: "2026-06-25T20:00:00Z", venueCode: "lumen", groupCode: "E" },
  // 57. Tunísia × Holanda → TUN (Colômbia) vs NED (Itália→?)
  { homeCode: "TUN", awayCode: "NED", datetime_utc: "2026-06-25T23:00:00Z", venueCode: "levis", groupCode: "F" },
  // 58. Japão × Suécia → JPN (Bélgica) vs SWE (Países Baixos)
  { homeCode: "JPN", awayCode: "SWE", datetime_utc: "2026-06-25T23:00:00Z", venueCode: "arrowhead", groupCode: "F" },
  // 59. Turquia × EUA → TUR (Albânia→?) vs USA (Inglaterra)
  { homeCode: "TUR", awayCode: "USA", datetime_utc: "2026-06-26T02:00:00Z", venueCode: "gillette", groupCode: "D" },
  // 60. Paraguai × Austrália → PAR (Espanha) vs AUS (Jamaica→?)
  { homeCode: "PAR", awayCode: "AUS", datetime_utc: "2026-06-26T02:00:00Z", venueCode: "estadio-azteca", groupCode: "D" },

  // RODADA 6
  // 61. Noruega × França → NOR (Nova Zelândia) vs FRA (Camarões→?)
  { homeCode: "NOR", awayCode: "FRA", datetime_utc: "2026-06-26T19:00:00Z", venueCode: "estadio-akron", groupCode: "I" },
  // 62. Senegal × Iraque → SEN (Suíça) vs IRQ (Estados Unidos)
  { homeCode: "SEN", awayCode: "IRQ", datetime_utc: "2026-06-26T19:00:00Z", venueCode: "estadio-bbva", groupCode: "I" },
  // 63. Uruguai × Espanha → URU (Áustria) vs ESP (Croácia)
  //    URY code for real Uruguay; our URU = Áustria
  { homeCode: "URY", awayCode: "ESP", datetime_utc: "2026-06-27T00:00:00Z", venueCode: "bmo-field", groupCode: "H" },
  // 64. Cabo Verde × Arábia Saudita → CPV (Senegal) vs KSA (Dinamarca→?)
  { homeCode: "CPV", awayCode: "KSA", datetime_utc: "2026-06-27T00:00:00Z", venueCode: "bc-place", groupCode: "H" },
  // 65. Nova Zelândia × Bélgica → NZL (Hungria→?) vs BEL (Uruguai)
  { homeCode: "NZL", awayCode: "BEL", datetime_utc: "2026-06-27T03:00:00Z", venueCode: "metlife", groupCode: "G" },
  // 66. Egito × Irã → EGY (Suécia) vs IRN (Egito)
  { homeCode: "EGY", awayCode: "IRN", datetime_utc: "2026-06-27T03:00:00Z", venueCode: "sofistadium", groupCode: "G" },
  // 67. Panamá × Inglaterra → PAN (Cabo Verde) vs ENG (Ucrânia→?)
  { homeCode: "PAN", awayCode: "ENG", datetime_utc: "2026-06-27T21:00:00Z", venueCode: "att-stadium", groupCode: "L" },
  // 68. Croácia × Gana → CRO (Bolívia→?) vs GHA (Grécia→?)
  { homeCode: "CRO", awayCode: "GHA", datetime_utc: "2026-06-27T21:00:00Z", venueCode: "hard-rock", groupCode: "L" },
  // 69. Colômbia × Portugal → COL (Chile→?) vs POR (Polônia→?)
  { homeCode: "COL", awayCode: "POR", datetime_utc: "2026-06-27T23:30:00Z", venueCode: "mercedes-benz", groupCode: "K" },
  // 70. RD Congo × Uzbequistão → COD (Irlanda→?) vs UZB (Jordânia)
  { homeCode: "COD", awayCode: "UZB", datetime_utc: "2026-06-27T23:30:00Z", venueCode: "nrg", groupCode: "K" },
  // 71. Jordânia × Argentina → JOR (Venezuela→?) vs ARG (México)
  { homeCode: "JOR", awayCode: "ARG", datetime_utc: "2026-06-28T02:00:00Z", venueCode: "lincoln", groupCode: "J" },
  // 72. Argélia × Áustria → ALG (Paraguai) vs AUT (Canadá)
  //    Real: DZA (Argélia→?) vs AUT (Canadá) — DZA not in our DB
  { homeCode: "DZA", awayCode: "AUT", datetime_utc: "2026-06-28T02:00:00Z", venueCode: "lumen", groupCode: "J" },
];

// External venue → our venue ID
const venueMap = {
  "metlife": "metlife",
  "azteca": "estadio-azteca",
  "akron": "estadio-akron",
  "bbva": "estadio-bbva",
  "sofi": "sofistadium",
  "att": "att-stadium",
  "gillette": "gillette",
  "arrowhead": "arrowhead",
  "mercedes": "mercedes-benz",
  "nrg": "nrg",
  "lincoln": "lincoln",
  "levis": "levis",
  "lumen": "lumen",
  "bmo": "bmo-field",
  "bcplace": "bc-place",
  "hardrock": "hard-rock",
};

// Real team code → renamed name (for verification only)
const realCodeToName = {
  "MEX": "México", "KOR": "Coreia do Sul", "RSA": "África do Sul", "CZE": "Tchéquia",
  "CAN": "Canadá", "QAT": "Catar", "SUI": "Suíça", "BIH": "Bósnia",
  "BRA": "Brasil", "MAR": "Marrocos", "SCO": "Escócia", "HAI": "Haiti",
  "USA": "EUA", "PAR": "Paraguai", "AUS": "Austrália", "TUR": "Turquia",
  "GER": "Alemanha", "CIV": "Costa do Marfim", "CUW": "Curaçao", "ECU": "Equador",
  "NED": "Holanda", "JPN": "Japão", "SWE": "Suécia", "TUN": "Tunísia",
  "BEL": "Bélgica", "IRN": "Irã", "EGY": "Egito", "NZL": "N. Zelândia",
  "ESP": "Espanha", "KSA": "Arábia Saudita", "URY": "Uruguai", "CPV": "Cabo Verde",
  "FRA": "França", "SEN": "Senegal", "IRQ": "Iraque", "NOR": "Noruega",
  "ARG": "Argentina", "AUT": "Áustria", "DZA": "Argélia", "JOR": "Jordânia",
  "POR": "Portugal", "COD": "RD Congo", "UZB": "Uzbequistão", "COL": "Colômbia",
  "ENG": "Inglaterra", "CRO": "Croácia", "GHA": "Gana", "PAN": "Panamá",
};

// Fetch existing matches
const { data: existingMatches, error: fetchErr } = await supabase
  .from("matches")
  .select("id, match_number, phase, group_code, kickoff_utc, venue_id, home_team_id, away_team_id")
  .eq("phase", "group")
  .order("match_number");

if (fetchErr) { console.error("Erro ao buscar partidas:", fetchErr.message); process.exit(1); }

let updated = 0;
let matched = 0;
let notFound = 0;

for (const real of realMatches) {
  // Try to find in our DB by home+away team code match
  const dbMatch = existingMatches.find(m => 
    m.home_team_id === real.homeCode && m.away_team_id === real.awayCode
  );

  if (dbMatch) {
    matched++;
    const venue = venueMap[real.venueCode] || real.venueCode;
    const { error: updErr } = await supabase
      .from("matches")
      .update({ kickoff_utc: real.datetime_utc, venue_id: venue })
      .eq("id", dbMatch.id);
    if (updErr) {
      console.error(`Erro ao atualizar ${dbMatch.id}: ${updErr.message}`);
    } else {
      const hName = realCodeToName[real.homeCode] || real.homeCode;
      const aName = realCodeToName[real.awayCode] || real.awayCode;
      const dateStr = real.datetime_utc.slice(0, 10);
      console.log(`  ${dbMatch.id}: ${hName} vs ${aName} → ${dateStr}`);
      updated++;
    }
  } else {
    // Couldn't find this matchup in our DB
    // Try reversed (home/away swapped)
    const revMatch = existingMatches.find(m => 
      m.home_team_id === real.awayCode && m.away_team_id === real.homeCode
    );
    if (revMatch) {
      matched++;
      const venue = venueMap[real.venueCode] || real.venueCode;
      const { error: updErr } = await supabase
        .from("matches")
        .update({ kickoff_utc: real.datetime_utc, venue_id: venue })
        .eq("id", revMatch.id);
      if (updErr) {
        console.error(`Erro ao atualizar ${revMatch.id} (reverso): ${updErr.message}`);
      } else {
        const hName = realCodeToName[real.homeCode] || real.homeCode;
        console.log(`  ${revMatch.id}: (reverso) ${hName}... → ${real.datetime_utc.slice(0, 10)}`);
        updated++;
      }
    } else {
      const hName = realCodeToName[real.homeCode] || real.homeCode;
      const aName = realCodeToName[real.awayCode] || real.awayCode;
      console.warn(`  ⚠ Partida não encontrada no DB: ${hName} vs ${aName} (${real.homeCode}/${real.awayCode})`);
      notFound++;
    }
  }
}

console.log(`\nTotal: ${updated} atualizadas, ${matched} encontradas, ${notFound} não encontradas`);
