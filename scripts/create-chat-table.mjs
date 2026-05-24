const token = process.env.SUPABASE_TOKEN;
const ref = "fvkghxqzjcqewbqmnopy";

const sql = `
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select" ON messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "messages_insert" ON messages
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
`;

const endpoints = [
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  `https://api.supabase.com/v1/projects/${ref}/sql`,
];

for (const url of endpoints) {
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (r.ok) {
    console.log("Tabela 'messages' criada com RLS e Realtime ativado.");
    process.exit(0);
  }

  const text = await r.text();
  if (text.includes("already exists")) {
    console.log("A tabela 'messages' já existe.");
    process.exit(0);
  }

  if (url === endpoints[endpoints.length - 1]) {
    console.error("Erro em todos os endpoints:", text);
  }
}
