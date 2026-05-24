import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Delete all existing goalscorers
  const { error: delErr } = await supabase.from("goalscorers").delete().gte("goals", 0);
  if (delErr) { console.log("Delete error:", delErr.message); return; }
  console.log("Deleted existing goalscorers");

  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));

  // Add match_id column via pg_graphql
  const gql = JSON.stringify({
    query: `mutation {
      alterTable(input: {
        tableName: { schema: public, name: goalscorers }
        addColumns: [{ name: match_id, type: Text }]
      }) { column { name type } }
    }`
  });
  const r = await fetch("https://fvkghxqzjcqewbqmnopy.supabase.co/graphql/v1", {
    method: "POST",
    headers: { "Content-Type": "application/json", "apiKey": supabaseKey, "Authorization": "Bearer " + supabaseKey },
    body: gql,
  });
  const txt = await r.text();
  console.log("GraphQL response:", r.status, txt.slice(0, 300));

  // Now check columns
  const { data: cols } = await supabase.from("goalscorers").select("player_id, team_id, goals, match_id").limit(0);
  console.log("Column check: match_id present?", cols !== null ? "yes (null is ok)" : "no");
}

run();
