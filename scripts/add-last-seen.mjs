const token = process.env.SUPABASE_TOKEN;
const ref = "fvkghxqzjcqewbqmnopy";

const sql = `
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;
`;

const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

if (r.ok) {
  console.log("Coluna 'last_seen_at' adicionada à tabela profiles.");
} else {
  const err = await r.text();
  if (err.includes("already exists")) {
    console.log("A coluna já existe.");
  } else {
    console.error("Erro:", err);
  }
}
