// Second pass: try "(footballer)" suffix for remaining players without photos
const token = process.env.SUPABASE_TOKEN;
const ref = "fvkghxqzjcqewbqmnopy";
const apiUrl = "https://api.supabase.com/v1/projects/" + ref + "/database/query";

async function query(sql) {
  const r = await fetch(apiUrl, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!r.ok) throw new Error("SQL error " + r.status);
  const text = await r.text();
  if (!text) return [];
  return JSON.parse(text);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log("Fetching remaining players without photos...");
  const players = await query("SELECT id, name, team_id FROM players WHERE photo_url IS NULL ORDER BY team_id, name");
  console.log("Found " + players.length + " remaining players");

  let found = 0;
  let notFound = 0;
  let errors = 0;
  const batchSize = 10;

  // Phase 2a: Try "(footballer)" suffix in batches
  for (let i = 0; i < players.length; i += batchSize) {
    const batch = players.slice(i, i + batchSize);
    process.stdout.write("\r[Phase A " + Math.min(i + batchSize, players.length) + "/" + players.length + "] found=" + found + " noimg=" + notFound + " err=" + errors);

    try {
      const url = "https://en.wikipedia.org/w/api.php?action=query&titles=" +
        batch.map(p => encodeURIComponent(p.name + " (footballer)")).join("|") + "&prop=pageimages&pithumbsize=200&format=json&redirects=1";
      const resp = await fetch(url, { headers: { "User-Agent": "WC26App/1.0" } });

      if (!resp.ok) {
        await sleep(5000);
        i -= batchSize;
        continue;
      }

      const data = await resp.json();
      const pages = data.query?.pages || {};

      for (const p of batch) {
        let photoUrl = null;
        const suffixName = p.name + " (footballer)";
        for (const pageId of Object.keys(pages)) {
          if (pageId === "-1") continue;
          const page = pages[pageId];
          if (page.title.toLowerCase() === suffixName.toLowerCase() && page.thumbnail?.source) {
            photoUrl = page.thumbnail.source;
            break;
          }
        }

        if (photoUrl) {
          await query("UPDATE players SET photo_url = '" + photoUrl.replace(/'/g, "''") + "' WHERE id = '" + p.id + "'");
          found++;
        } else {
          notFound++;
        }
      }
    } catch (e) {
      errors += batch.length;
    }
    await sleep(1500);
  }

  // Phase 2b: For remaining, try a general Wikipedia search
  console.log("\n\nPhase B: General search for still-missing players...");
  const remaining = await query("SELECT id, name, team_id FROM players WHERE photo_url IS NULL ORDER BY team_id, name");
  console.log("Remaining: " + remaining.length);

  for (let i = 0; i < remaining.length; i++) {
    const p = remaining[i];
    process.stdout.write("\r[Phase B " + (i + 1) + "/" + remaining.length + "] " + p.team_id + " - " + p.name + "... ");

    try {
      const url = "https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
        encodeURIComponent(p.name + " footballer") + "&gsrlimit=3&prop=pageimages&pithumbsize=200&format=json";
      const resp = await fetch(url, { headers: { "User-Agent": "WC26App/1.0" } });

      if (resp.ok) {
        const data = await resp.json();
        const pages = data.query?.pages || {};
        let foundUrl = null;

        for (const pageId of Object.keys(pages)) {
          if (pageId === "-1") continue;
          if (pages[pageId].thumbnail?.source) {
            foundUrl = pages[pageId].thumbnail.source;
            break;
          }
        }

        if (foundUrl) {
          await query("UPDATE players SET photo_url = '" + foundUrl.replace(/'/g, "''") + "' WHERE id = '" + p.id + "'");
          found++;
          process.stdout.write("OK");
        } else {
          notFound++;
          process.stdout.write("SEM FOTO");
        }
      } else {
        notFound++;
        process.stdout.write("RATE");
      }
    } catch (e) {
      errors++;
      process.stdout.write("ERRO");
    }
    await sleep(1000);
  }

  const final = await query("SELECT COUNT(*) as c FROM players WHERE photo_url IS NULL");
  console.log("\n\n=== FINALIZADO ===");
  console.log("Total com foto agora: " + (1104 - final[0].c));
  console.log("Sem foto: " + final[0].c);
}

run().catch(e => console.error("Fatal:", e.message));
