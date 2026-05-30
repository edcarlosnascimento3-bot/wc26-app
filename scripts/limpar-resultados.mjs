import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const { error } = await supabase
  .from("matches")
  .update({ real_home: null, real_away: null })
  .eq("phase", "group");

if (error) {
  console.error("Erro ao limpar resultados:", error.message);
  process.exit(1);
}
console.log("Resultados simulados removidos com sucesso.");
