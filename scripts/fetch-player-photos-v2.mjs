import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const agent = { headers: { "User-Agent": "WC2026-App/1.0" } };

// Known Wikipedia page titles
const nameToWiki = {
  "Vinícius Júnior":"Vinícius Júnior","Rodrygo":"Rodrygo","Gabriel Martinelli":"Gabriel Martinelli",
  "Richarlison":"Richarlison","Raphinha":"Raphinha","Antony":"Antony (footballer)","Endrick":"Endrick (footballer)",
  "McTominay":"Scott McTominay","Ziyech":"Hakim Ziyech","En-Nesyri":"Youssef En-Nesyri",
  "Amrabat":"Sofyan Amrabat","Julián Álvarez":"Julián Álvarez (footballer)","Messi":"Lionel Messi",
  "Mbappé":"Kylian Mbappé","Griezmann":"Antoine Griezmann","Dembélé":"Ousmane Dembélé",
  "Osimhen":"Victor Osimhen","Lookman":"Ademola Lookman",
  "Bruno Fernandes":"Bruno Fernandes (footballer, born 1994)","Rafael Leão":"Rafael Leão",
  "Gonçalo Ramos":"Gonçalo Ramos","Rafa Leão":"Rafael Leão","Ramos":"Gonçalo Ramos",
  "Palhinha":"João Palhinha","Taremi":"Mehdi Taremi","Kudus":"Mohammed Kudus",
  "Saka":"Bukayo Saka","Kane":"Harry Kane","Lamine Yamal":"Lamine Yamal",
  "Bellingham":"Jude Bellingham","Morata":"Álvaro Morata","Oyarzabal":"Mikel Oyarzabal",
  "Foden":"Phil Foden","Rice":"Declan Rice","Havertz":"Kai Havertz",
  "Musiala":"Jamal Musiala","Wirtz":"Florian Wirtz",
  "Minamino":"Takumi Minamino","Doan":"Ritsu Doan","Asano":"Takuma Asano",
  "Immobile":"Ciro Immobile","Chiesa":"Federico Chiesa","Donnarumma":"Gianluigi Donnarumma",
  "Xavi Simons":"Xavi Simons","De Ketelaere":"Charles De Ketelaere",
  "Luis Díaz":"Luis Díaz (footballer, born 1997)","Raspadori":"Giacomo Raspadori",
  "Scamacca":"Gianluca Scamacca","Barella":"Nicolò Barella",
  "Depay":"Memphis Depay","Gakpo":"Cody Gakpo","James Rodríguez":"James Rodríguez",
  "Valverde":"Federico Valverde","Salah":"Mohamed Salah","Núñez":"Darwin Núñez",
  "Szoboszlai":"Dominik Szoboszlai","Isak":"Alexander Isak","Elanga":"Anthony Elanga",
  "Kramarić":"Andrej Kramarić","Højlund":"Rasmus Højlund",
  "Sabitzer":"Marcel Sabitzer","Arnautović":"Marko Arnautović","Modrić":"Luka Modrić",
  "Eriksen":"Christian Eriksen","Toko Ekambi":"Karl Toko Ekambi","Onana":"André Onana",
  "Aboubakar":"Vincent Aboubakar","Embolo":"Breel Embolo","Pulisic":"Christian Pulisic",
  "Akanji":"Manuel Akanji","Shaqiri":"Xherdan Shaqiri","Jiménez":"Raúl Jiménez",
  "Lozano":"Hirving Lozano","Almirón":"Miguel Almirón","Sanabria":"Antonio Sanabria",
  "Rondón":"Salomón Rondón","Lewandowski":"Robert Lewandowski","Zieliński":"Piotr Zieliński",
  "Vargas":"Eduardo Vargas","Alexis Sánchez":"Alexis Sánchez","Mudryk":"Mykhailo Mudryk",
  "Zinchenko":"Oleksandr Zinchenko","Yarmolenko":"Andriy Yarmolenko","Dovbyk":"Artem Dovbyk",
  "Bakasetas":"Anastasios Bakasetas","Mæhle":"Joakim Mæhle","Jensen":"Mathias Jensen",
  "Varga":"Barnabás Varga","Marmoush":"Omar Marmoush",
  "Trézéguet":"Trézéguet (Egyptian footballer)","Pašalić":"Mario Pašalić",
  "Gregoritsch":"Michael Gregoritsch","Schlager":"Xaver Schlager",
  "N'Koudou":"Georges-Kévin N'Koudou","Mbekeli":"Jérôme Mbekeli",
  "Weiss":"Vladimír Weiss (footballer, born 1989)","Souttar":"Harry Souttar",
  "Duke":"Mitchell Duke","Mabil":"Awer Mabil","Yılmaz":"Burak Yılmaz",
  "Paik Seung-ho":"Paik Seung-ho","Montes":"César Montes","Córdoba":"Jhon Córdoba",
  "Antuna":"Uriel Antuna","González":"Derlis González","Cullen":"Josh Cullen",
  "Masouras":"Giorgos Masouras","Monteiro":"Jovane Monteiro","Pina":"Rui Pina",
  "Saucedo":"Carlos Saucedo","Guðjohnsen":"Eiður Guðjohnsen","Árnason":"Kári Árnason",
  "Kudryashov":"Fyodor Kudryashov","Vega":"Alexis Vega (footballer)",
};

async function getImageUrl(pageTitle) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
  const res = await fetch(url, agent);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.originalimage?.source || data?.thumbnail?.source || null;
}

async function searchWiki(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=3`;
  const res = await fetch(url, { ...agent, headers: { ...agent.headers, "Accept": "application/json" } });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.query?.search?.map(s => s.title) || [];
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
  let ok = 0, fail = 0, notFound = 0;
  const notFoundNames = [];

  for (const [playerId, name] of entries) {
    const pageTitle = nameToWiki[name];
    if (!pageTitle) { notFound++; notFoundNames.push(name); continue; }

    try {
      let imgUrl = await getImageUrl(pageTitle);
      
      if (!imgUrl) {
        // Fallback: search for footballer
        const results = await searchWiki(`${name} footballer`);
        for (const title of results) {
          imgUrl = await getImageUrl(title);
          if (imgUrl) break;
        }
      }

      if (!imgUrl) {
        // Fallback: Portuguese Wikipedia for Brazilian players
        const ptUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
        const ptRes = await fetch(ptUrl, agent);
        if (ptRes.ok) {
          const ptData = await ptRes.json();
          imgUrl = ptData?.originalimage?.source || ptData?.thumbnail?.source || null;
        }
      }

      if (imgUrl) {
        const { error } = await supabase.from("players").update({ photo_url: imgUrl }).eq("id", playerId);
        if (error) { fail++; console.log(`  Error updating ${name}: ${error.message}`); }
        else { ok++; }
      } else {
        notFound++; notFoundNames.push(name);
      }
    } catch(e) {
      fail++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone! ${ok} photos updated, ${notFound} not found, ${fail} errors`);
  if (notFoundNames.length > 0) {
    console.log("\nStill not found:", notFoundNames.join(", "));
  }
}

run();
