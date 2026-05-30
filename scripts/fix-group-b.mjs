import { createClient } from "@supabase/supabase-js";
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Fix Group B duplicate matches
// B-3: SUI vs CAN → CAN vs QAT
// B-4: CAN vs QAT → SUI vs BIH
// B-5: SUI vs CAN → keep (now unique, was duplicate with B-3)

const fixes = [
  { id: "B-3", home: "CAN", away: "QAT" },
  { id: "B-4", home: "SUI", away: "BIH" },
];

for (const f of fixes) {
  const { error } = await s.from("matches")
    .update({ home_team_id: f.home, away_team_id: f.away })
    .eq("id", f.id);
  if (error) {
    console.error(`Error updating ${f.id}: ${error.message}`);
  } else {
    console.log(`Updated ${f.id}: ${f.home} vs ${f.away}`);
  }
}

// Verify
const { data: checks } = await s.from("matches")
  .select("id, home_team_id, away_team_id")
  .in("id", ["B-3", "B-4", "B-5", "B-6"])
  .order("id");
for (const m of checks) {
  console.log(`${m.id}: ${m.home_team_id} vs ${m.away_team_id}`);
}
