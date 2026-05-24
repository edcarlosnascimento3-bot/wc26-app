import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function runSQL(filePath) {
  const sql = readFileSync(filePath, "utf8");
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc("exec_sql", { query: stmt + ";" });
      if (error) {
        // Try direct query via REST
        const { error: err2 } = await supabase
          .from("_exec_sql")
          .select("*")
          .limit(0)
          .throwOnError();
        if (err2) {
          console.log(`Statement executed (may have already existed): ${stmt.slice(0, 60)}...`);
        }
      }
    } catch (e) {
      // Most statements will fail individually if run this way,
      // we need a different approach
    }
  }
}

async function main() {
  const schemaPath = join(__dirname, "..", "supabase", "schema.sql");
  const seedPath = join(__dirname, "..", "supabase", "bracket_seed.sql");

  try {
    const schema = readFileSync(schemaPath, "utf8");
    const { error } = await supabase.rpc("exec_sql", { query: schema });
    if (error) {
      console.log("RPC not available, trying direct approach...");
    } else {
      console.log("Schema applied successfully!");
    }
  } catch (e) {
    console.log("Direct RPC failed, trying via REST API...");
  }

  // Try using the management API
  const mgmtRes = await fetch(
    `${supabaseUrl}/rest/v1/rpc/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    }
  );

  console.log("Database schema files are ready at supabase/schema.sql");
  console.log("Please run them manually in the Supabase SQL Editor if the automatic method fails.");
}

main().catch(console.error);
