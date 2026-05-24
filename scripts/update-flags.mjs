const token = process.env.SUPABASE_TOKEN;
const ref = "fvkghxqzjcqewbqmnopy";

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

let sql = "";
for (const [code, iso] of Object.entries(flagMap)) {
  const flagUrl = "https://flagcdn.com/w40/" + iso + ".png";
  sql += "UPDATE public.teams SET flag_url = '" + flagUrl + "' WHERE id = '" + code + "';\n";
}

fetch("https://api.supabase.com/v1/projects/" + ref + "/database/query", {
  method: "POST",
  headers: {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ query: sql })
}).then(res => {
  console.log("Status:", res.status);
  return res.text();
}).then(t => {
  console.log("Bandeiras atualizadas com sucesso!");
}).catch(e => console.error("Erro:", e.message));
