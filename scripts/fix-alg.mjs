import { createClient } from "@supabase/supabase-js";
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
await s.from("teams")
  .update({ name: "Argélia", group_code: "J", flag_url: "https://flagcdn.com/w320/dz.png", code: "DZA" })
  .eq("id", "ALG");
console.log("OK");
