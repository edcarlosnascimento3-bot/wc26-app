import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// These matches weren't found by the main script due to code differences
const matches = [
  // URY→URU code difference
  { homeCode: "URY", awayCode: "CPV", datetime_utc: "2026-06-21T22:00:00Z", venueCode: "lincoln" },
  { homeCode: "URY", awayCode: "ESP", datetime_utc: "2026-06-27T00:00:00Z", venueCode: "bmo-field" },
  { homeCode: "KSA", awayCode: "URY", datetime_utc: "2026-06-15T22:00:00Z", venueCode: "bmo-field" },
  // DZA→ALG code difference
  { homeCode: "DZA", awayCode: "AUT", datetime_utc: "2026-06-28T02:00:00Z", venueCode: "lumen" },
  { homeCode: "JOR", awayCode: "DZA", datetime_utc: "2026-06-23T03:00:00Z", venueCode: "estadio-azteca" },
  { homeCode: "ARG", awayCode: "DZA", datetime_utc: "2026-06-17T01:00:00Z", venueCode: "att-stadium" },
];

const venueMap = {
  "lincoln": "lincoln",
  "bmo-field": "bmo-field",
  "lumen": "lumen",
  "estadio-azteca": "estadio-azteca",
  "att-stadium": "att-stadium",
};

// URY → URU mapping in DB
const codeMap = { "URY": "URU", "DZA": "ALG" };

let updated = 0;
for (const m of matches) {
  const dbHome = codeMap[m.homeCode] || m.homeCode;
  const dbAway = codeMap[m.awayCode] || m.awayCode;

  // Try direct
  let { data: rows } = await supabase
    .from("matches")
    .select("id")
    .eq("home_team_id", dbHome).eq("away_team_id", dbAway);
  
  if (!rows || rows.length === 0) {
    // Try reversed
    const { data: rev } = await supabase
      .from("matches")
      .select("id")
      .eq("home_team_id", dbAway).eq("away_team_id", dbHome);
    rows = rev;
  }

  if (rows && rows.length > 0) {
    const venue = venueMap[m.venueCode] || m.venueCode;
    const { error } = await supabase
      .from("matches")
      .update({ kickoff_utc: m.datetime_utc, venue_id: venue })
      .eq("id", rows[0].id);
    if (error) console.error(`Erro: ${error.message}`);
    else { console.log(`  ${rows[0].id}: ${m.homeCode}→${dbHome} vs ${m.awayCode}→${dbAway}`); updated++; }
  } else {
    console.warn(`  ⚠ Ainda não encontrado: ${dbHome} vs ${dbAway}`);
  }
}
console.log(`\n${updated} atualizadas`);
