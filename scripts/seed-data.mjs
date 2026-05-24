import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const token = process.env.SUPABASE_TOKEN;
const ref = "fvkghxqzjcqewbqmnopy";

let sql = "";

// 1. Teams
const teams = [
  ["MEX", "Mexico", "MEX", "A"], ["KOR", "Coreia do Sul", "KOR", "A"],
  ["CZE", "Republica Tcheca", "CZE", "A"], ["RSA", "Africa do Sul", "RSA", "A"],
  ["CAN", "Canada", "CAN", "B"], ["SUI", "Suiça", "SUI", "B"],
  ["QAT", "Catar", "QAT", "B"], ["BIH", "Bosnia", "BIH", "B"],
  ["BRA", "Brasil", "BRA", "C"], ["MAR", "Marrocos", "MAR", "C"],
  ["SCO", "Escocia", "SCO", "C"], ["HAI", "Haiti", "HAI", "C"],
  ["USA", "Estados Unidos", "USA", "D"], ["PAR", "Paraguai", "PAR", "D"],
  ["TUR", "Turquia", "TUR", "D"], ["AUS", "Australia", "AUS", "D"],
  ["GER", "Alemanha", "GER", "E"], ["ECU", "Equador", "ECU", "E"],
  ["CIV", "Costa do Marfim", "CIV", "E"], ["CUW", "Curaçao", "CUW", "E"],
  ["NED", "Holanda", "NED", "F"], ["JPN", "Japao", "JPN", "F"],
  ["SWE", "Suecia", "SWE", "F"], ["TUN", "Tunisia", "TUN", "F"],
  ["BEL", "Belgica", "BEL", "G"], ["IRN", "Ira", "IRN", "G"],
  ["EGY", "Egito", "EGY", "G"], ["NZL", "Nova Zelandia", "NZL", "G"],
  ["ESP", "Espanha", "ESP", "H"], ["URU", "Uruguai", "URU", "H"],
  ["KSA", "Arabia Saudita", "KSA", "H"], ["CPV", "Cabo Verde", "CPV", "H"],
  ["FRA", "Franca", "FRA", "I"], ["SEN", "Senegal", "SEN", "I"],
  ["NOR", "Noruega", "NOR", "I"], ["IRQ", "Iraque", "IRQ", "I"],
  ["ARG", "Argentina", "ARG", "J"], ["AUT", "Austria", "AUT", "J"],
  ["ALG", "Argelia", "ALG", "J"], ["JOR", "Jordania", "JOR", "J"],
  ["POR", "Portugal", "POR", "K"], ["COL", "Colombia", "COL", "K"],
  ["UZB", "Uzbequistao", "UZB", "K"], ["COD", "RD Congo", "COD", "K"],
  ["ENG", "Inglaterra", "ENG", "L"], ["CRO", "Croacia", "CRO", "L"],
  ["PAN", "Panama", "PAN", "L"], ["GHA", "Gana", "GHA", "L"],
];

sql += "INSERT INTO public.teams (id, name, code, group_code) VALUES\n";
sql += teams.map(t => "('" + t[0] + "','" + t[1] + "','" + t[2] + "','" + t[3] + "')").join(",\n");
sql += "\nON CONFLICT (id) DO NOTHING;\n\n";

// 2. Venues
const venues = [
  ["estadio-azteca", "Estadio Azteca", "Cidade do Mexico", "Mexico", 87823],
  ["estadio-bbva", "Estadio BBVA", "Monterrey", "Mexico", 53500],
  ["estadio-akron", "Estadio Akron", "Guadalajara", "Mexico", 46232],
  ["sofistadium", "SoFi Stadium", "Los Angeles", "EUA", 70240],
  ["att-stadium", "AT&T Stadium", "Dallas", "EUA", 80000],
  ["gillette", "Gillette Stadium", "Boston", "EUA", 65878],
  ["metlife", "MetLife Stadium", "Nova Jersey", "EUA", 82500],
  ["arrowhead", "Arrowhead Stadium", "Kansas City", "EUA", 76416],
  ["mercedes-benz", "Mercedes-Benz Stadium", "Atlanta", "EUA", 71000],
  ["nrg", "NRG Stadium", "Houston", "EUA", 71795],
  ["hard-rock", "Hard Rock Stadium", "Miami", "EUA", 64767],
  ["lincoln", "Lincoln Financial Field", "Filadelfia", "EUA", 69176],
  ["levis", "Levis Stadium", "San Francisco", "EUA", 68500],
  ["lumen", "Lumen Field", "Seattle", "EUA", 68740],
  ["bc-place", "BC Place", "Vancouver", "Canada", 54500],
  ["bmo-field", "BMO Field", "Toronto", "Canada", 30000],
];

sql += "INSERT INTO public.venues (id, name, city, country, capacity) VALUES\n";
sql += venues.map(v => "('" + v[0] + "','" + v[1] + "','" + v[2] + "','" + v[3] + "'," + v[4] + ")").join(",\n");
sql += "\nON CONFLICT (id) DO NOTHING;\n\n";

// 3. Matches
function parseMatch(id, num, phase, group, date, timeBRT, venue, home, away) {
  let h = parseInt(timeBRT.split(":")[0]);
  let min = parseInt(timeBRT.split(":")[1]);
  let utcHour = h + 3;
  let day = parseInt(date.substring(8, 10));
  let month = date.substring(5, 7);
  let year = date.substring(0, 4);

  if (utcHour >= 24) { day += 1; utcHour -= 24; }

  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[parseInt(month)]) {
    day = 1;
    month = String(parseInt(month) + 1).padStart(2, "0");
  }

  const utcDate = year + "-" + month + "-" + String(day).padStart(2, "0") + " " +
                  String(utcHour).padStart(2, "0") + ":" + String(min).padStart(2, "0") + ":00+00";
  return { id, num, phase, group, kickoff: utcDate, venue, home, away };
}

const rawMatches = [
  ["A-1", 1, "group", "A", "2026-06-11", "16:00", "estadio-azteca", "MEX", "RSA"],
  ["A-2", 2, "group", "A", "2026-06-11", "23:00", "estadio-akron", "KOR", "CZE"],
  ["A-3", 3, "group", "A", "2026-06-18", "13:00", "mercedes-benz", "CZE", "RSA"],
  ["A-4", 4, "group", "A", "2026-06-18", "22:00", "estadio-akron", "MEX", "KOR"],
  ["A-5", 5, "group", "A", "2026-06-24", "22:00", "estadio-azteca", "CZE", "MEX"],
  ["A-6", 6, "group", "A", "2026-06-24", "22:00", "estadio-bbva", "RSA", "KOR"],
  ["B-1", 7, "group", "B", "2026-06-12", "16:00", "bmo-field", "CAN", "BIH"],
  ["B-2", 8, "group", "B", "2026-06-13", "16:00", "levis", "QAT", "SUI"],
  ["B-3", 9, "group", "B", "2026-06-18", "16:00", "sofistadium", "SUI", "CAN"],
  ["B-4", 10, "group", "B", "2026-06-18", "19:00", "bc-place", "CAN", "QAT"],
  ["B-5", 11, "group", "B", "2026-06-24", "16:00", "bc-place", "SUI", "CAN"],
  ["B-6", 12, "group", "B", "2026-06-24", "16:00", "lumen", "BIH", "QAT"],
  ["C-1", 13, "group", "C", "2026-06-13", "19:00", "metlife", "BRA", "MAR"],
  ["C-2", 14, "group", "C", "2026-06-13", "22:00", "gillette", "HAI", "SCO"],
  ["C-3", 15, "group", "C", "2026-06-19", "19:00", "gillette", "SCO", "MAR"],
  ["C-4", 16, "group", "C", "2026-06-19", "21:30", "lincoln", "BRA", "HAI"],
  ["C-5", 17, "group", "C", "2026-06-24", "19:00", "hard-rock", "SCO", "BRA"],
  ["C-6", 18, "group", "C", "2026-06-24", "19:00", "mercedes-benz", "MAR", "HAI"],
  ["D-1", 19, "group", "D", "2026-06-12", "22:00", "sofistadium", "USA", "PAR"],
  ["D-2", 20, "group", "D", "2026-06-13", "01:00", "bc-place", "AUS", "TUR"],
  ["D-3", 21, "group", "D", "2026-06-19", "01:00", "levis", "TUR", "PAR"],
  ["D-4", 22, "group", "D", "2026-06-19", "16:00", "lumen", "USA", "AUS"],
  ["D-5", 23, "group", "D", "2026-06-25", "23:00", "sofistadium", "TUR", "USA"],
  ["D-6", 24, "group", "D", "2026-06-25", "23:00", "levis", "PAR", "AUS"],
  ["E-1", 25, "group", "E", "2026-06-14", "14:00", "nrg", "GER", "CUW"],
  ["E-2", 26, "group", "E", "2026-06-14", "20:00", "lincoln", "CIV", "ECU"],
  ["E-3", 27, "group", "E", "2026-06-20", "17:00", "bmo-field", "GER", "CIV"],
  ["E-4", 28, "group", "E", "2026-06-20", "21:00", "arrowhead", "ECU", "CUW"],
  ["E-5", 29, "group", "E", "2026-06-25", "17:00", "metlife", "ECU", "GER"],
  ["E-6", 30, "group", "E", "2026-06-25", "17:00", "lincoln", "CUW", "CIV"],
  ["F-1", 31, "group", "F", "2026-06-14", "17:00", "att-stadium", "NED", "JPN"],
  ["F-2", 32, "group", "F", "2026-06-14", "23:00", "estadio-bbva", "SWE", "TUN"],
  ["F-3", 33, "group", "F", "2026-06-20", "14:00", "nrg", "NED", "SWE"],
  ["F-4", 34, "group", "F", "2026-06-20", "01:00", "estadio-bbva", "TUN", "JPN"],
  ["F-5", 35, "group", "F", "2026-06-25", "20:00", "att-stadium", "JPN", "SWE"],
  ["F-6", 36, "group", "F", "2026-06-25", "20:00", "arrowhead", "TUN", "NED"],
  ["G-1", 37, "group", "G", "2026-06-15", "16:00", "lumen", "BEL", "EGY"],
  ["G-2", 38, "group", "G", "2026-06-15", "22:00", "sofistadium", "IRN", "NZL"],
  ["G-3", 39, "group", "G", "2026-06-21", "16:00", "sofistadium", "BEL", "IRN"],
  ["G-4", 40, "group", "G", "2026-06-21", "22:00", "bc-place", "NZL", "EGY"],
  ["G-5", 41, "group", "G", "2026-06-26", "00:00", "lumen", "EGY", "IRN"],
  ["G-6", 42, "group", "G", "2026-06-26", "00:00", "bc-place", "NZL", "BEL"],
  ["H-1", 43, "group", "H", "2026-06-15", "13:00", "mercedes-benz", "ESP", "CPV"],
  ["H-2", 44, "group", "H", "2026-06-15", "19:00", "hard-rock", "KSA", "URU"],
  ["H-3", 45, "group", "H", "2026-06-21", "13:00", "mercedes-benz", "ESP", "KSA"],
  ["H-4", 46, "group", "H", "2026-06-21", "19:00", "hard-rock", "URU", "CPV"],
  ["H-5", 47, "group", "H", "2026-06-26", "21:00", "nrg", "CPV", "KSA"],
  ["H-6", 48, "group", "H", "2026-06-26", "21:00", "estadio-akron", "URU", "ESP"],
  ["I-1", 49, "group", "I", "2026-06-16", "16:00", "metlife", "FRA", "SEN"],
  ["I-2", 50, "group", "I", "2026-06-16", "19:00", "gillette", "IRQ", "NOR"],
  ["I-3", 51, "group", "I", "2026-06-22", "18:00", "lincoln", "FRA", "IRQ"],
  ["I-4", 52, "group", "I", "2026-06-22", "21:00", "metlife", "NOR", "SEN"],
  ["I-5", 53, "group", "I", "2026-06-26", "16:00", "gillette", "NOR", "FRA"],
  ["I-6", 54, "group", "I", "2026-06-26", "16:00", "bmo-field", "SEN", "IRQ"],
  ["J-1", 55, "group", "J", "2026-06-16", "22:00", "arrowhead", "ARG", "ALG"],
  ["J-2", 56, "group", "J", "2026-06-17", "01:00", "levis", "AUT", "JOR"],
  ["J-3", 57, "group", "J", "2026-06-22", "14:00", "att-stadium", "ARG", "AUT"],
  ["J-4", 58, "group", "J", "2026-06-23", "00:00", "levis", "JOR", "ALG"],
  ["J-5", 59, "group", "J", "2026-06-27", "23:00", "arrowhead", "ALG", "AUT"],
  ["J-6", 60, "group", "J", "2026-06-27", "23:00", "att-stadium", "JOR", "ARG"],
  ["K-1", 61, "group", "K", "2026-06-17", "14:00", "nrg", "POR", "COD"],
  ["K-2", 62, "group", "K", "2026-06-17", "23:00", "estadio-azteca", "UZB", "COL"],
  ["K-3", 63, "group", "K", "2026-06-23", "14:00", "nrg", "POR", "UZB"],
  ["K-4", 64, "group", "K", "2026-06-23", "23:00", "estadio-akron", "COL", "COD"],
  ["K-5", 65, "group", "K", "2026-06-27", "20:30", "hard-rock", "COL", "POR"],
  ["K-6", 66, "group", "K", "2026-06-27", "20:30", "mercedes-benz", "COD", "UZB"],
  ["L-1", 67, "group", "L", "2026-06-17", "17:00", "att-stadium", "ENG", "CRO"],
  ["L-2", 68, "group", "L", "2026-06-17", "20:00", "bmo-field", "GHA", "PAN"],
  ["L-3", 69, "group", "L", "2026-06-23", "17:00", "gillette", "ENG", "GHA"],
  ["L-4", 70, "group", "L", "2026-06-23", "20:00", "bmo-field", "PAN", "CRO"],
  ["L-5", 71, "group", "L", "2026-06-27", "18:00", "metlife", "PAN", "ENG"],
  ["L-6", 72, "group", "L", "2026-06-27", "19:00", "lincoln", "CRO", "GHA"],
];

const matches = rawMatches.map(m => parseMatch(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]));

sql += "INSERT INTO public.matches (id, match_number, phase, group_code, kickoff_utc, venue_id, home_team_id, away_team_id) VALUES\n";
sql += matches.map(m => "('" + m.id + "'," + m.num + ",'" + m.phase + "','" + m.group + "','" + m.kickoff + "','" + m.venue + "','" + m.home + "','" + m.away + "')").join(",\n");
sql += "\nON CONFLICT (id) DO NOTHING;\n";

// Write to file
const outPath = join(__dirname, "..", "supabase", "seed_completo.sql");
writeFileSync(outPath, sql);
console.log("SQL gerado em supabase/seed_completo.sql");
console.log("Total de linhas SQL:", sql.split("\n").length);

// Execute via API
fetch("https://api.supabase.com/v1/projects/" + ref + "/database/query", {
  method: "POST",
  headers: {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ query: sql })
}).then(res => {
  console.log("Status:", res.status);
  return res.text().then(t => ({ status: res.status, text: t }));
}).then(({ status, text }) => {
  if (status === 201) console.log("Dados inseridos com sucesso!");
  else console.log("Resposta:", text.slice(0, 300));
  
  // Now update flags
  const flagMap = {
    MEX: "mx", KOR: "kr", CZE: "cz", RSA: "za",
    CAN: "ca", SUI: "ch", QAT: "qa", BIH: "ba",
    BRA: "br", MAR: "ma", SCO: "gb-sct", HAI: "ht",
    USA: "us", PAR: "py", TUR: "tr", AUS: "au",
    GER: "de", ECU: "ec", CIV: "ci", CUW: "cw",
    NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
    BEL: "be", IRN: "ir", EGY: "eg", NZL: "nz",
    ESP: "es", URU: "uy", KSA: "sa", CPV: "cv",
    FRA: "fr", SEN: "sn", NOR: "no", IRQ: "iq",
    ARG: "ar", AUT: "at", ALG: "dz", JOR: "jo",
    POR: "pt", COL: "co", UZB: "uz", COD: "cd",
    ENG: "gb-eng", CRO: "hr", PAN: "pa", GHA: "gh",
  };
  
  return Promise.all(Object.entries(flagMap).map(([code, iso]) => {
    const flagUrl = "https://flagcdn.com/w40/" + iso + ".png";
    const q = "UPDATE public.teams SET flag_url = '" + flagUrl + "' WHERE id = '" + code + "';";
    return fetch("https://api.supabase.com/v1/projects/" + ref + "/database/query", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ query: q })
    });
  })).then(() => console.log("Bandeiras atualizadas!"));
}).catch(e => console.error("Erro:", e.message));
