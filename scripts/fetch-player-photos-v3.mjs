import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const agent = { headers: { "User-Agent": "WC2026-App/2.0" } };

// Skip fictional players that don't exist on Wikipedia
const skipNames = new Set([
  "Jónsson", "Árnason", "Duke", "Mabil", "Andrew", "Nicholson",
  "Benguch", "Yilmaz", "Yılmaz", "Ramos", "Rafa Leão",
  "Paik Seung-ho", "Kudryashov", "Jensen", "Mæhle", "Schlager",
  "Mbekeli", "González", "Cullen", "Al-Rashdan", "Masouras",
  "Monteiro", "Pina", "Saucedo", "Souttar", "Flood",
]);

// v3: explicitly listed known working titles & direct image URLs
const directImages = {
  "Vinícius Júnior": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Vinicius_J%C3%BAnior_2023_%28cropped%29.jpg/250px-Vinicius_J%C3%BAnior_2023_%28cropped%29.jpg",
  "Rodrygo": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Rodrygo_2023_%28cropped%29.jpg/250px-Rodrygo_2023_%28cropped%29.jpg",
  "Gabriel Martinelli": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Gabriel_Martinelli_2023_%28cropped%29.jpg/250px-Gabriel_Martinelli_2023_%28cropped%29.jpg",
  "Richarlison": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Richarlison_2023_%28cropped%29.jpg/250px-Richarlison_2023_%28cropped%29.jpg",
  "Antony": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Antony_2023_%28cropped%29.jpg/250px-Antony_2023_%28cropped%29.jpg",
  "Endrick": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Endrick_2024_%28cropped%29.jpg/250px-Endrick_2024_%28cropped%29.jpg",
  "McTominay": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Scott_McTominay_2023_%28cropped%29.jpg/250px-Scott_McTominay_2023_%28cropped%29.jpg",
  "Ziyech": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Hakim_Ziyech_2023_%28cropped%29.jpg/250px-Hakim_Ziyech_2023_%28cropped%29.jpg",
  "En-Nesyri": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Youssef_En-Nesyri_2023_%28cropped%29.jpg/250px-Youssef_En-Nesyri_2023_%28cropped%29.jpg",
  "Amrabat": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Sofyan_Amrabat_2023_%28cropped%29.jpg/250px-Sofyan_Amrabat_2023_%28cropped%29.jpg",
  "Bruno Fernandes": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Bruno_Fernandes_2023_%28cropped%29.jpg/250px-Bruno_Fernandes_2023_%28cropped%29.jpg",
  "Rafael Leão": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Rafael_Le%C3%A3o_2023_%28cropped%29.jpg/250px-Rafael_Le%C3%A3o_2023_%28cropped%29.jpg",
  "Gonçalo Ramos": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Gon%C3%A7alo_Ramos_2023_%28cropped%29.jpg/250px-Gon%C3%A7alo_Ramos_2023_%28cropped%29.jpg",
  "Palhinha": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Jo%C3%A3o_Palhinha_2023_%28cropped%29.jpg/250px-Jo%C3%A3o_Palhinha_2023_%28cropped%29.jpg",
  "Taremi": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mehdi_Taremi_2023_%28cropped%29.jpg/250px-Mehdi_Taremi_2023_%28cropped%29.jpg",
  "Kudus": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Mohammed_Kudus_2023_%28cropped%29.jpg/250px-Mohammed_Kudus_2023_%28cropped%29.jpg",
  "Saka": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Bukayo_Saka_2023_%28cropped%29.jpg/250px-Bukayo_Saka_2023_%28cropped%29.jpg",
  "Kane": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Harry_Kane_2023_%28cropped%29.jpg/250px-Harry_Kane_2023_%28cropped%29.jpg",
  "Lamine Yamal": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Lamine_Yamal_2024_%28cropped%29.jpg/250px-Lamine_Yamal_2024_%28cropped%29.jpg",
  "Bellingham": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Jude_Bellingham_2023_%28cropped%29.jpg/250px-Jude_Bellingham_2023_%28cropped%29.jpg",
  "Morata": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/%C3%81lvaro_Morata_2023_%28cropped%29.jpg/250px-%C3%81lvaro_Morata_2023_%28cropped%29.jpg",
  "Oyarzabal": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mikel_Oyarzabal_2023_%28cropped%29.jpg/250px-Mikel_Oyarzabal_2023_%28cropped%29.jpg",
  "Foden": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Phil_Foden_2023_%28cropped%29.jpg/250px-Phil_Foden_2023_%28cropped%29.jpg",
  "Rice": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Declan_Rice_2023_%28cropped%29.jpg/250px-Declan_Rice_2023_%28cropped%29.jpg",
  "Havertz": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Kai_Havertz_2023_%28cropped%29.jpg/250px-Kai_Havertz_2023_%28cropped%29.jpg",
  "Musiala": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Jamal_Musiala_2023_%28cropped%29.jpg/250px-Jamal_Musiala_2023_%28cropped%29.jpg",
  "Wirtz": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Florian_Wirtz_2023_%28cropped%29.jpg/250px-Florian_Wirtz_2023_%28cropped%29.jpg",
  "Minamino": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Takumi_Minamino_2023_%28cropped%29.jpg/250px-Takumi_Minamino_2023_%28cropped%29.jpg",
  "Doan": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Ritsu_Doan_2023_%28cropped%29.jpg/250px-Ritsu_Doan_2023_%28cropped%29.jpg",
  "Asano": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Takuma_Asano_2023_%28cropped%29.jpg/250px-Takuma_Asano_2023_%28cropped%29.jpg",
  "Immobile": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ciro_Immobile_2023_%28cropped%29.jpg/250px-Ciro_Immobile_2023_%28cropped%29.jpg",
  "Chiesa": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Federico_Chiesa_2023_%28cropped%29.jpg/250px-Federico_Chiesa_2023_%28cropped%29.jpg",
  "Donnarumma": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Gianluigi_Donnarumma_2023_%28cropped%29.jpg/250px-Gianluigi_Donnarumma_2023_%28cropped%29.jpg",
  "Xavi Simons": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Xavi_Simons_2023_%28cropped%29.jpg/250px-Xavi_Simons_2023_%28cropped%29.jpg",
  "De Ketelaere": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Charles_De_Ketelaere_2023_%28cropped%29.jpg/250px-Charles_De_Ketelaere_2023_%28cropped%29.jpg",
  "Luis Díaz": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Luis_D%C3%ADaz_2023_%28cropped%29.jpg/250px-Luis_D%C3%ADaz_2023_%28cropped%29.jpg",
  "Raspadori": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Giacomo_Raspadori_2023_%28cropped%29.jpg/250px-Giacomo_Raspadori_2023_%28cropped%29.jpg",
  "Scamacca": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Gianluca_Scamacca_2023_%28cropped%29.jpg/250px-Gianluca_Scamacca_2023_%28cropped%29.jpg",
  "Barella": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Nicol%C3%B2_Barella_2023_%28cropped%29.jpg/250px-Nicol%C3%B2_Barella_2023_%28cropped%29.jpg",
  "Depay": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Memphis_Depay_2023_%28cropped%29.jpg/250px-Memphis_Depay_2023_%28cropped%29.jpg",
  "Gakpo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Cody_Gakpo_2023_%28cropped%29.jpg/250px-Cody_Gakpo_2023_%28cropped%29.jpg",
  "James Rodríguez": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/James_Rodr%C3%ADguez_2023_%28cropped%29.jpg/250px-James_Rodr%C3%ADguez_2023_%28cropped%29.jpg",
  "Valverde": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Federico_Valverde_2023_%28cropped%29.jpg/250px-Federico_Valverde_2023_%28cropped%29.jpg",
  "Trézéguet": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Tr%C3%A9z%C3%A9guet_%28footballer%29.jpg/250px-Tr%C3%A9z%C3%A9guet_%28footballer%29.jpg",
  "Varga": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Barnab%C3%A1s_Varga_2023_%28cropped%29.jpg/250px-Barnab%C3%A1s_Varga_2023_%28cropped%29.jpg",
  "Isak": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Alexander_Isak_2023_%28cropped%29.jpg/250px-Alexander_Isak_2023_%28cropped%29.jpg",
  "Elanga": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Anthony_Elanga_2023_%28cropped%29.jpg/250px-Anthony_Elanga_2023_%28cropped%29.jpg",
  "Núñez": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Darwin_N%C3%BA%C3%B1ez_2023_%28cropped%29.jpg/250px-Darwin_N%C3%BA%C3%B1ez_2023_%28cropped%29.jpg",
  "Szoboszlai": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Dominik_Szoboszlai_2023_%28cropped%29.jpg/250px-Dominik_Szoboszlai_2023_%28cropped%29.jpg",
  "Marmoush": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Omar_Marmoush_2023_%28cropped%29.jpg/250px-Omar_Marmoush_2023_%28cropped%29.jpg",
  "Kramarić": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Andrej_Kramari%C4%87_2023_%28cropped%29.jpg/250px-Andrej_Kramari%C4%87_2023_%28cropped%29.jpg",
  "Højlund": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Rasmus_H%C3%B8jlund_2023_%28cropped%29.jpg/250px-Rasmus_H%C3%B8jlund_2023_%28cropped%29.jpg",
  "Sabitzer": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Marcel_Sabitzer_2023_%28cropped%29.jpg/250px-Marcel_Sabitzer_2023_%28cropped%29.jpg",
  "Arnautović": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Marko_Arnautovi%C4%87_2023_%28cropped%29.jpg/250px-Marko_Arnautovi%C4%87_2023_%28cropped%29.jpg",
  "Modrić": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Luka_Modri%C4%87_2023_%28cropped%29.jpg/250px-Luka_Modri%C4%87_2023_%28cropped%29.jpg",
  "Eriksen": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Christian_Eriksen_2023_%28cropped%29.jpg/250px-Christian_Eriksen_2023_%28cropped%29.jpg",
  "Aboubakar": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Vincent_Aboubakar_2023_%28cropped%29.jpg/250px-Vincent_Aboubakar_2023_%28cropped%29.jpg",
  "Pulisic": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Christian_Pulisic_2023_%28cropped%29.jpg/250px-Christian_Pulisic_2023_%28cropped%29.jpg",
  "Shaqiri": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Xherdan_Shaqiri_2023_%28cropped%29.jpg/250px-Xherdan_Shaqiri_2023_%28cropped%29.jpg",
  "Antuna": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Uriel_Antuna_2023_%28cropped%29.jpg/250px-Uriel_Antuna_2023_%28cropped%29.jpg",
  "Zieliński": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Piotr_Zieli%C5%84ski_2023_%28cropped%29.jpg/250px-Piotr_Zieli%C5%84ski_2023_%28cropped%29.jpg",
  "Vargas": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Eduardo_Vargas_2023_%28cropped%29.jpg/250px-Eduardo_Vargas_2023_%28cropped%29.jpg",
  "Alexis Sánchez": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Alexis_S%C3%A1nchez_2023_%28cropped%29.jpg/250px-Alexis_S%C3%A1nchez_2023_%28cropped%29.jpg",
  "Mudryk": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Mykhailo_Mudryk_2023_%28cropped%29.jpg/250px-Mykhailo_Mudryk_2023_%28cropped%29.jpg",
  "Bakasetas": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Anastasios_Bakasetas_2023_%28cropped%29.jpg/250px-Anastasios_Bakasetas_2023_%28cropped%29.jpg",
  "Zinchenko": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Oleksandr_Zinchenko_2023_%28cropped%29.jpg/250px-Oleksandr_Zinchenko_2023_%28cropped%29.jpg",
  "Yarmolenko": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Andriy_Yarmolenko_2023_%28cropped%29.jpg/250px-Andriy_Yarmolenko_2023_%28cropped%29.jpg",
  "Dovbyk": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Artem_Dovbyk_2023_%28cropped%29.jpg/250px-Artem_Dovbyk_2023_%28cropped%29.jpg",
};

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
  let ok = 0, skip = 0;

  for (const [playerId, name] of entries) {
    const imgUrl = directImages[name];
    if (!imgUrl || skipNames.has(name)) { skip++; continue; }

    await new Promise(r => setTimeout(r, 500));
    
    // Verify image is accessible
    const head = await fetch(imgUrl, { method: "HEAD" }).catch(() => null);
    if (!head || !head.ok) { console.log(`  Image unreachable for ${name}`); skip++; continue; }

    const { error } = await supabase.from("players").update({ photo_url: imgUrl }).eq("id", playerId);
    if (error) { console.log(`  Error ${name}: ${error.message}`); }
    else { ok++; }
  }

  console.log(`\nDone! ${ok} photos updated, ${skip} skipped`);
}

run();
