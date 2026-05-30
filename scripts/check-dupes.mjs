import { createClient } from "@supabase/supabase-js";
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const { data: matches, error } = await s.from("matches")
  .select("id, home_team_id, away_team_id, group_code, kickoff_utc")
  .limit(80);
if (error) { console.error(error); process.exit(1); }

const groups = {};
for (const m of matches) {
  if (!m.id?.includes("-")) continue;
  const g = m.id[0];
  if (!groups[g]) groups[g] = [];
  groups[g].push(m);
}

for (const [letter, gMatches] of Object.entries(groups).sort()) {
  console.log(`\n=== Group ${letter} (${gMatches.length} matches) ===`);
  const pairings = gMatches.map(m => [m.home_team_id, m.away_team_id].sort().join("-"));
  const seen = {};
  for (const p of pairings) {
    seen[p] = (seen[p] || 0) + 1;
  }
  const dupes = Object.entries(seen).filter(([, count]) => count > 1);
  if (dupes.length > 0) {
    console.log(`  ❌ DUPLICATES:`);
    for (const [pair, count] of dupes) {
      const instances = gMatches.filter(m => [m.home_team_id, m.away_team_id].sort().join("-") === pair);
      for (const inst of instances) {
        console.log(`    ${inst.id}: ${inst.home_team_id} vs ${inst.away_team_id}`);
      }
    }
  } else {
    console.log(`  ✓ All unique`);
  }
  
  // Check all teams appear 3 times each
  const teamCounts = {};
  for (const m of gMatches) {
    teamCounts[m.home_team_id] = (teamCounts[m.home_team_id] || 0) + 1;
    teamCounts[m.away_team_id] = (teamCounts[m.away_team_id] || 0) + 1;
  }
  for (const [team, count] of Object.entries(teamCounts)) {
    if (count !== 3) {
      console.log(`  ⚠ ${team} appears ${count} times (should be 3)`);
    }
  }
}
