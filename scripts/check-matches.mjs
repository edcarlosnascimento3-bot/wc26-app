import { createClient } from "@supabase/supabase-js";
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const { data, error } = await s.from("matches").select("id,home_id,away_id,round").limit(80);
if (error) { console.error(error); process.exit(1); }
console.log("Total:", data?.length);
const groupA = data?.filter(m => m.id.startsWith("A-")) || [];
console.table(groupA.map(m => ({ id: m.id, home: m.home_id, away: m.away_id, round: m.round })));
const groupLetters = [...new Set(data?.filter(m => m.id.includes("-")).map(m => m.id[0]) || [])].join(",");
console.log("Group letters:", groupLetters);
