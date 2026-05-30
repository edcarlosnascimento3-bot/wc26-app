import { createClient } from "@supabase/supabase-js";
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Get all group-stage matches
const { data: matches, error } = await s.from("matches").select("id, home_team_id, away_team_id, group_code, kickoff_utc").limit(80);
if (error) { console.error(error); process.exit(1); }

// Check each group letter matches what the teams say
const { data: teams } = await s.from("teams").select("id, name, group_code");
const teamMap = Object.fromEntries(teams?.map(t => [t.id, t]) || []);

let mismatch = 0;
for (const m of matches) {
  if (!m.id?.includes("-")) continue;
  const groupLetter = m.id[0];
  const home = teamMap[m.home_team_id];
  const away = teamMap[m.away_team_id];
  if (!home || !away) {
    console.log(`Missing team: ${m.id} (${m.home_team_id}/${m.away_team_id})`);
    mismatch++;
    continue;
  }
  let ok = true;
  if (home.group_code !== groupLetter) {
    console.log(`MISMATCH: ${m.id} — home ${home.id} (${home.name}) is in group ${home.group_code} but match is in ${groupLetter}`);
    ok = false;
  }
  if (away.group_code !== groupLetter) {
    console.log(`MISMATCH: ${m.id} — away ${away.id} (${away.name}) is in group ${away.group_code} but match is in ${groupLetter}`);
    ok = false;
  }
  if (ok) {
    console.log(`OK: ${m.id} — ${home.name} (${home.id}) vs ${away.name} (${away.id}) [Group ${groupLetter}]`);
  } else mismatch++;
}

console.log(`\n${mismatch} mismatches out of ${matches.length} matches`);
