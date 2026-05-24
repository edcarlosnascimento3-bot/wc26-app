import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeamento time -> DB team_id
const teamId = {
  "Brasil":"MEX","Marrocos":"RSA","Escócia":"KOR","Honduras":"CZE",
  "Argentina":"CAN","França":"BIH","Nigéria":"QAT","Islândia":"SUI",
  "Portugal":"BRA","Austrália":"MAR","Irã":"SCO","Gana":"HAI",
  "Inglaterra":"USA","Espanha":"PAR","Jamaica":"AUS","Albânia":"TUR",
  "Alemanha":"GER","Japão":"CIV","Turquia":"CUW","Coreia do Sul":"ECU",
  "Itália":"NED","Bélgica":"JPN","Países Baixos":"SWE","Colômbia":"TUN",
  "Uruguai":"BEL","Suécia":"EGY","Egito":"IRN","Hungria":"NZL",
  "Croácia":"ESP","Dinamarca":"KSA","Áustria":"URU","Senegal":"CPV",
  "Camarões":"FRA","Suíça":"SEN","Estados Unidos":"IRQ","Nova Zelândia":"NOR",
  "México":"ARG","Paraguai":"ALG","Canadá":"AUT","Venezuela":"JOR",
  "Polônia":"POR","Chile":"COL","Irlanda":"COD","Jordânia":"UZB",
  "Ucrânia":"ENG","Bolívia":"CRO","Grécia":"GHA","Cabo Verde":"PAN",
};

// Artilheiros por partida: { match_id, time, jogador, gols }
const artilheiros = [
  // Grupo A
  {m:"A-1",t:"Brasil",j:"Vinícius Júnior",g:1},{m:"A-1",t:"Brasil",j:"Endrick",g:1},{m:"A-1",t:"Brasil",j:"Rodrygo",g:1},{m:"A-1",t:"Marrocos",j:"Amrabat",g:1},
  {m:"A-2",t:"Escócia",j:"McTominay",g:1},
  {m:"A-3",t:"Brasil",j:"Gabriel Martinelli",g:1},{m:"A-3",t:"Brasil",j:"Richarlison",g:1},
  {m:"A-4",t:"Marrocos",j:"Ziyech",g:1},{m:"A-4",t:"Marrocos",j:"En-Nesyri",g:1},{m:"A-4",t:"Honduras",j:"Benguch",g:1},
  {m:"A-5",t:"Brasil",j:"Vinícius Júnior",g:2},{m:"A-5",t:"Brasil",j:"Raphinha",g:1},{m:"A-5",t:"Brasil",j:"Antony",g:1},
  {m:"A-6",t:"Marrocos",j:"Ziyech",g:1},{m:"A-6",t:"Escócia",j:"McTominay",g:1},
  // Grupo B
  {m:"B-1",t:"Argentina",j:"Julián Álvarez",g:1},
  {m:"B-2",t:"Nigéria",j:"Osimhen",g:1},{m:"B-2",t:"Nigéria",j:"Lookman",g:1},{m:"B-2",t:"Islândia",j:"Guðjohnsen",g:1},
  {m:"B-4",t:"Argentina",j:"Messi",g:1},{m:"B-4",t:"Argentina",j:"Julián Álvarez",g:1},
  {m:"B-3",t:"França",j:"Mbappé",g:1},{m:"B-3",t:"França",j:"Griezmann",g:1},{m:"B-3",t:"França",j:"Dembélé",g:1},{m:"B-3",t:"Islândia",j:"Jónsson",g:1},
  {m:"B-6",t:"Argentina",j:"Messi",g:1},{m:"B-6",t:"Islândia",j:"Árnason",g:1},
  {m:"B-5",t:"França",j:"Mbappé",g:1},{m:"B-5",t:"França",j:"Griezmann",g:1},{m:"B-5",t:"Nigéria",j:"Osimhen",g:1},
  // Grupo C
  {m:"C-1",t:"Portugal",j:"Bruno Fernandes",g:1},{m:"C-1",t:"Portugal",j:"Rafael Leão",g:1},{m:"C-1",t:"Portugal",j:"Gonçalo Ramos",g:1},
  {m:"C-5",t:"Portugal",j:"Rafa Leão",g:1},
  {m:"C-6",t:"Austrália",j:"Duke",g:1},{m:"C-6",t:"Austrália",j:"Mabil",g:1},{m:"C-6",t:"Gana",j:"Kudus",g:1},
  {m:"C-1",t:"Portugal",j:"Ramos",g:1},{m:"C-1",t:"Portugal",j:"Palhinha",g:1},{m:"C-1",t:"Austrália",j:"Duke",g:1},{m:"C-1",t:"Austrália",j:"Souttar",g:1},
  {m:"C-2",t:"Irã",j:"Taremi",g:1},{m:"C-2",t:"Gana",j:"Kudus",g:1},
  // Grupo D
  {m:"D-1",t:"Inglaterra",j:"Saka",g:1},{m:"D-1",t:"Inglaterra",j:"Kane",g:1},{m:"D-1",t:"Espanha",j:"Lamine Yamal",g:1},
  {m:"D-2",t:"Jamaica",j:"Andrew",g:1},
  {m:"D-4",t:"Inglaterra",j:"Bellingham",g:1},{m:"D-4",t:"Jamaica",j:"Nicholson",g:1},
  {m:"D-3",t:"Espanha",j:"Morata",g:1},{m:"D-3",t:"Espanha",j:"Oyarzabal",g:1},
  {m:"D-5",t:"Inglaterra",j:"Foden",g:1},{m:"D-5",t:"Inglaterra",j:"Rice",g:1},{m:"D-5",t:"Inglaterra",j:"Kane",g:1},
  {m:"D-6",t:"Espanha",j:"Oyarzabal",g:1},
  // Grupo E
  {m:"E-3",t:"Alemanha",j:"Havertz",g:1},
  {m:"E-4",t:"Turquia",j:"Yilmaz",g:1},
  {m:"E-1",t:"Alemanha",j:"Musiala",g:1},{m:"E-1",t:"Alemanha",j:"Wirtz",g:1},{m:"E-1",t:"Turquia",j:"Yılmaz",g:1},
  {m:"E-2",t:"Japão",j:"Minamino",g:1},{m:"E-2",t:"Japão",j:"Doan",g:1},{m:"E-2",t:"Coreia do Sul",j:"Paik Seung-ho",g:1},
  {m:"E-6",t:"Japão",j:"Asano",g:1},{m:"E-6",t:"Turquia",j:"Kudryashov",g:1},
  // Grupo F
  {m:"F-1",t:"Itália",j:"Immobile",g:1},
  {m:"F-2",t:"Países Baixos",j:"Depay",g:1},{m:"F-2",t:"Países Baixos",j:"Gakpo",g:1},{m:"F-2",t:"Colômbia",j:"James Rodríguez",g:1},
  {m:"F-3",t:"Itália",j:"Chiesa",g:1},{m:"F-3",t:"Itália",j:"Donnarumma",g:1},{m:"F-3",t:"Países Baixos",j:"Xavi Simons",g:1},
  {m:"F-4",t:"Bélgica",j:"De Ketelaere",g:1},{m:"F-4",t:"Colômbia",j:"Luis Díaz",g:1},
  {m:"F-6",t:"Itália",j:"Raspadori",g:1},{m:"F-6",t:"Itália",j:"Scamacca",g:1},{m:"F-6",t:"Itália",j:"Barella",g:1},
  // Grupo G
  {m:"G-1",t:"Uruguai",j:"Valverde",g:1},
  {m:"G-2",t:"Egito",j:"Salah",g:1},{m:"G-2",t:"Egito",j:"Trézéguet",g:1},{m:"G-2",t:"Hungria",j:"Varga",g:1},
  {m:"G-4",t:"Suécia",j:"Isak",g:1},{m:"G-4",t:"Suécia",j:"Elanga",g:1},
  {m:"G-6",t:"Uruguai",j:"Núñez",g:1},{m:"G-6",t:"Hungria",j:"Szoboszlai",g:1},
  {m:"G-5",t:"Suécia",j:"Isak",g:1},{m:"G-5",t:"Egito",j:"Marmoush",g:1},
  // Grupo H
  {m:"H-3",t:"Croácia",j:"Kramarić",g:1},{m:"H-3",t:"Dinamarca",j:"Højlund",g:1},
  {m:"H-4",t:"Áustria",j:"Sabitzer",g:1},{m:"H-4",t:"Áustria",j:"Arnautović",g:1},
  {m:"H-6",t:"Croácia",j:"Modrić",g:1},{m:"H-6",t:"Áustria",j:"Pašalić",g:1},{m:"H-6",t:"Áustria",j:"Gregoritsch",g:1},
  {m:"H-5",t:"Dinamarca",j:"Eriksen",g:1},
  {m:"H-1",t:"Croácia",j:"Kramarić",g:1},
  {m:"H-2",t:"Dinamarca",j:"Jensen",g:1},{m:"H-2",t:"Dinamarca",j:"Mæhle",g:1},{m:"H-2",t:"Áustria",j:"Arnautović",g:1},{m:"H-2",t:"Áustria",j:"Schlager",g:1},
  // Grupo I
  {m:"I-1",t:"Camarões",j:"Toko Ekambi",g:1},{m:"I-1",t:"Camarões",j:"Onana",g:1},{m:"I-1",t:"Camarões",j:"Aboubakar",g:1},{m:"I-1",t:"Suíça",j:"Embolo",g:1},
  {m:"I-2",t:"Estados Unidos",j:"Pulisic",g:1},
  {m:"I-3",t:"Camarões",j:"Aboubakar",g:1},
  {m:"I-4",t:"Suíça",j:"Akanji",g:1},{m:"I-4",t:"Suíça",j:"Shaqiri",g:1},
  {m:"I-5",t:"Camarões",j:"N'Koudou",g:1},{m:"I-5",t:"Camarões",j:"Mbekeli",g:1},
  {m:"I-6",t:"Suíça",j:"Weiss",g:1},
  // Grupo J
  {m:"J-1",t:"México",j:"Jiménez",g:1},{m:"J-1",t:"México",j:"Lozano",g:1},
  {m:"J-3",t:"México",j:"Vega",g:1},
  {m:"J-4",t:"Paraguai",j:"Almirón",g:1},{m:"J-4",t:"Paraguai",j:"Sanabria",g:1},{m:"J-4",t:"Venezuela",j:"Rondón",g:1},
  {m:"J-6",t:"México",j:"Montes",g:1},{m:"J-6",t:"México",j:"Córdoba",g:1},{m:"J-6",t:"México",j:"Antuna",g:1},
  {m:"J-5",t:"Paraguai",j:"González",g:1},
  // Grupo K
  {m:"K-5",t:"Polônia",j:"Lewandowski",g:1},{m:"K-5",t:"Polônia",j:"Zieliński",g:1},
  {m:"K-6",t:"Irlanda",j:"Flood",g:1},
  {m:"K-1",t:"Polônia",j:"Lewandowski",g:1},{m:"K-1",t:"Irlanda",j:"Cullen",g:1},
  {m:"K-2",t:"Chile",j:"Vargas",g:1},{m:"K-2",t:"Chile",j:"Alexis Sánchez",g:1},
  {m:"K-3",t:"Polônia",j:"Lewandowski",g:1},{m:"K-3",t:"Polônia",j:"Zieliński",g:2},{m:"K-3",t:"Jordânia",j:"Al-Rashdan",g:1},
  // Grupo L
  {m:"L-1",t:"Ucrânia",j:"Mudryk",g:1},
  {m:"L-2",t:"Grécia",j:"Bakasetas",g:1},{m:"L-2",t:"Grécia",j:"Masouras",g:1},{m:"L-2",t:"Cabo Verde",j:"Monteiro",g:1},
  {m:"L-3",t:"Ucrânia",j:"Zinchenko",g:1},{m:"L-3",t:"Ucrânia",j:"Yarmolenko",g:1},
  {m:"L-5",t:"Ucrânia",j:"Dovbyk",g:1},{m:"L-5",t:"Ucrânia",j:"Zinchenko",g:2},{m:"L-5",t:"Cabo Verde",j:"Pina",g:1},
  {m:"L-6",t:"Grécia",j:"Bakasetas",g:1},{m:"L-6",t:"Bolívia",j:"Saucedo",g:1},
];

// Para não repetir: mapeia {time + jogador} -> player já criado
const playerCache = new Map();

async function getPlayerId(timeNome, jogador) {
  const key = timeNome + "|" + jogador;
  if (playerCache.has(key)) return playerCache.get(key);
  const tid = teamId[timeNome];
  if (!tid) return null;
  
  // Procura jogador no banco
  const { data } = await supabase
    .from("players")
    .select("id")
    .eq("team_id", tid)
    .ilike("name", jogador)
    .limit(1);
  
  if (data?.length > 0) {
    playerCache.set(key, data[0].id);
    return data[0].id;
  }
  
  // Cria novo jogador com posição padrão
  const { data: novo, error } = await supabase
    .from("players")
    .insert({ team_id: tid, name: jogador, position: "MF" })
    .select("id")
    .single();
  
  if (error) { console.error("Erro criar jogador", timeNome, jogador, error.message); return null; }
  playerCache.set(key, novo.id);
  return novo.id;
}

async function main() {
  let ok = 0, err = 0;

  for (const a of artilheiros) {
    const pid = await getPlayerId(a.t, a.j);
    if (!pid) { err++; continue; }
    const tid = teamId[a.t];
    
    const { error } = await supabase
      .from("goalscorers")
      .upsert({ player_id: pid, team_id: tid, goals: a.g }, { onConflict: "player_id,team_id" });
    
    if (error) { err++; console.error("Erro", a.t, a.j, error.message); }
    else ok++;
  }

  console.log(`\nConcluído! ${ok} registros inseridos, ${err} erros.`);
}

main();
