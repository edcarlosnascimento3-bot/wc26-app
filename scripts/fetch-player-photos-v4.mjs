import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const agent = { headers: { "User-Agent": "WC2026App/3.0 (https://github.com; ed@example.com)" } };

const wikiPages = {
  "Vinícius Júnior": "Vinícius Júnior",
  "Rodrygo": "Rodrygo",
  "Gabriel Martinelli": "Gabriel Martinelli",
  "Richarlison": "Richarlison",
  "Antony": "Antony (footballer)",
  "Endrick": "Endrick (footballer)",
  "McTominay": "Scott McTominay",
  "Ziyech": "Hakim Ziyech",
  "En-Nesyri": "Youssef En-Nesyri",
  "Amrabat": "Sofyan Amrabat",
  "Bruno Fernandes": "Bruno Fernandes (footballer, born 1994)",
  "Rafael Leão": "Rafael Leão",
  "Gonçalo Ramos": "Gonçalo Ramos",
  "Palhinha": "João Palhinha",
  "Taremi": "Mehdi Taremi",
  "Kudus": "Mohammed Kudus",
  "Saka": "Bukayo Saka",
  "Kane": "Harry Kane",
  "Lamine Yamal": "Lamine Yamal",
  "Bellingham": "Jude Bellingham",
  "Morata": "Álvaro Morata",
  "Oyarzabal": "Mikel Oyarzabal",
  "Foden": "Phil Foden",
  "Rice": "Declan Rice",
  "Havertz": "Kai Havertz",
  "Musiala": "Jamal Musiala",
  "Wirtz": "Florian Wirtz",
  "Minamino": "Takumi Minamino",
  "Doan": "Ritsu Doan",
  "Asano": "Takuma Asano",
  "Immobile": "Ciro Immobile",
  "Chiesa": "Federico Chiesa",
  "Donnarumma": "Gianluigi Donnarumma",
  "Xavi Simons": "Xavi Simons",
  "De Ketelaere": "Charles De Ketelaere",
  "Luis Díaz": "Luis Díaz (footballer, born 1997)",
  "Raspadori": "Giacomo Raspadori",
  "Scamacca": "Gianluca Scamacca",
  "Barella": "Nicolò Barella",
  "Depay": "Memphis Depay",
  "Gakpo": "Cody Gakpo",
  "James Rodríguez": "James Rodríguez",
  "Valverde": "Federico Valverde",
  "Trézéguet": "Trézéguet (Egyptian footballer)",
  "Varga": "Barnabás Varga",
  "Isak": "Alexander Isak",
  "Elanga": "Anthony Elanga",
  "Núñez": "Darwin Núñez",
  "Szoboszlai": "Dominik Szoboszlai",
  "Marmoush": "Omar Marmoush",
  "Kramarić": "Andrej Kramarić",
  "Højlund": "Rasmus Højlund",
  "Sabitzer": "Marcel Sabitzer",
  "Arnautović": "Marko Arnautović",
  "Modrić": "Luka Modrić",
  "Eriksen": "Christian Eriksen",
  "Aboubakar": "Vincent Aboubakar",
  "Pulisic": "Christian Pulisic",
  "Shaqiri": "Xherdan Shaqiri",
  "Antuna": "Uriel Antuna",
  "Zieliński": "Piotr Zieliński",
  "Vargas": "Eduardo Vargas",
  "Alexis Sánchez": "Alexis Sánchez",
  "Mudryk": "Mykhailo Mudryk",
  "Bakasetas": "Anastasios Bakasetas",
  "Zinchenko": "Oleksandr Zinchenko",
  "Yarmolenko": "Andriy Yarmolenko",
  "Dovbyk": "Artem Dovbyk",
};

async function getImageUrl(pageTitle) {
  const url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(pageTitle);
  const res = await fetch(url, agent);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.originalimage?.source || data?.thumbnail?.source || null;
}

async function run() {
  const { data: scorers } = await supabase
    .from("goalscorers")
    .select("player_id, players!inner(id, name, photo_url)");
  if (!scorers) { console.log("Erro"); return; }

  const seen = new Map();
  for (const r of scorers) {
    const p = Array.isArray(r.players) ? r.players[0] : r.players;
    if (!p || p.photo_url || seen.has(p.id)) continue;
    seen.set(p.id, p.name);
  }

  const entries = [...seen.entries()];
  let ok = 0, skip = 0, fail = 0;

  for (const [playerId, name] of entries) {
    const pageTitle = wikiPages[name];
    if (!pageTitle) { skip++; continue; }

    await new Promise(r => setTimeout(r, 2000)); // 2 seconds between requests

    try {
      const imgUrl = await getImageUrl(pageTitle);
      if (imgUrl) {
        const { error } = await supabase.from("players").update({ photo_url: imgUrl }).eq("id", playerId);
        if (error) { fail++; console.log("  Error updating", name, error.message); }
        else { ok++; console.log("  OK:", name); }
      } else {
        skip++;
        console.log("  No img:", name);
      }
    } catch(e) {
      fail++;
      console.log("  Error fetching", name, e.message);
    }
  }

  console.log(`\nDone! ${ok} photos updated, ${skip} skipped, ${fail} errors`);
}

run();
