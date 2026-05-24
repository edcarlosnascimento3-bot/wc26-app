"use client";
import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Message = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: { display_name: string; avatar_url: string | null } | null;
};

type Profile = { id: string; display_name: string; avatar_url: string | null };
type Team = { id: string; name: string; flag_url: string | null };

function matchStatus(kickoffMs: number, now: number) {
  if (now < kickoffMs) return { text: "Jogo não iniciado", cls: "text-gray-400" };
  const elapsed = (now - kickoffMs) / 60000;
  if (elapsed < 45) return { text: `${Math.floor(elapsed)}'`, cls: "text-green-600 font-bold" };
  if (elapsed < 60) return { text: "Intervalo", cls: "text-yellow-600 font-bold" };
  if (elapsed < 105) return { text: `${Math.floor(elapsed - 15)}'`, cls: "text-green-600 font-bold" };
  return { text: "Jogo finalizado", cls: "text-red-600 font-bold" };
}

function fmtBR(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function sameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}

export default function ChatPage() {
  const supabase = supabaseBrowser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [blockedToast, setBlockedToast] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(Date.now());
  const blockedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const emojis = [
    "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🫢","🫣","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥴","😵","🤯","🥳","🥺","😢","😭","😤","😠","😡","🤬","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾","🙌","👏","🤝","👍","👎","👊","✊","🤛","🤜","👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄","💋","👶","🧒","👦","👧","🧑","👱","👨","🧔","👩","🧓","👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷","👮","🕵️","💂","🥷","👷","🫅","🤴","👸","👳","👲","🧕","🤵","👰","🤰","🫃","🫄","🤱","👼","🎅","🤶","🦸","🦹","🧙","🧚","🧛","🧜","🧝","🧞","🧟","🧌","💆","💇","🚶","🧍","🧎","🏃","💃","🕺","🕴️","👯","🧖","🧗","🤸","⛹️","🏋️","🚴","🚵","🤼","🤽","🤾","🤺","⛷️","🏂","🪂","🏄","🚣","🏊","🤿","🧘","🛀","🛌","👭","👫","👬","💏","💑","👪","👤","👥","🫂","👣","🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰","🪲","🪳","🦟","🦗","🕷️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🪸","🐊","🐅","🐆","🦓","🦍","🦧","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛","🪶","🐓","🦃","🦤","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦫","🦦","🦥","🐁","🐀","🐿️","🦔","🐾","🐉","🐲","🌵","🎄","🌲","🌳","🌴","🪵","🌱","🌿","☘️","🍀","🎍","🪴","🎋","🍃","🍂","🍁","🪺","🪹","🍄","🐚","🪨","🌾","💐","🌷","🌹","🥀","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌙","🌎","🌍","🌏","🪐","💫","⭐","🌟","✨","⚡","☄️","💥","🔥","🌪️","🌈","☀️","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌬️","💨","💧","💦","🫧","☔","☂️","🌊","🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠","🫘","🥐","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🦴","🌭","🍔","🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯","🫔","🥗","🥘","🫕","🥫","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯","🥛","🍼","🫖","☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🫗","🥃","🍸","🍹","🧉","🍾","🧊","🥄","🍴","🍽️","🥣","🥡","🥢","🧂","⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳","🪁","🏹","🎣","🤿","🥊","🥋","🎯","🛹","🛼","🛷","⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️","🤼","🤸","🤺","⛹️","🤾","🏌️","🏇","🧘","🏄","🏊","🤽","🚣","🧗","🚵","🚴","🎪","🎭","🎨","🎬","🎤","🎧","🎼","🎹","🥁","🪘","🎷","🎺","🪗","🎸","🪕","🎻","🎲","♟️","🎯","🎳","🎮","🕹️","🎰","🚗","🚙","🚕","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🦯","🦽","🦼","🛴","🚲","🛵","🏍️","🛺","🚨","🚔","🚍","🚘","🚖","🛞","🚡","🚠","🚟","🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇","🚊","🚉","✈️","🛫","🛬","🛩️","💺","🛰️","🚀","🛸","🚁","🛶","⛵","🚤","🛥️","🛳️","⛴️","🚢","🛟","🪝","⚓","🛟","🛝","🏗️","🏘️","🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏩","🏪","🏫","🏬","🏭","🏯","🏰","💒","🗼","🗽","⛪","🕌","🛕","🕍","⛩️","🕋","⛲","⛺","🌁","🌃","🏙️","🌄","🌅","🌆","🌇","🌉","🗾","🏔️","⛰️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏟️","🏛️","🏗️","🧱","🪨","🪵","🛖","💒","🗼","🗽","⛪","🕌","🛕","🕍","⛩️","🕋","⛲","⛺","🌁","🌃","🏙️","🌄","🌅","🌆","🌇","🌉","🗾","🏔️","⛰️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏟️","🏛️","🏗️","🧱","🪨","🪵","🛖","💘","💝","💖","💗","💓","💞","💕","💟","❣️","💔","❤️‍🔥","❤️‍🩹","❤️","🩷","🧡","💛","💚","💙","🩵","💜","🤎","🖤","🩶","🤍","💋","💯","💢","💥","💫","💦","💨","🕳️","💬","🗨️","🗯️","💭","💤","👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄","💋","👶","🧒","👦","👧","🧑","👱","👨","🧔","👩","🧓","👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷","👮","🕵️","💂","🥷","👷","🫅","🤴","👸","👳","👲","🧕","🤵","👰","🤰","🫃","🫄","🤱","👼","🎅","🤶","🦸","🦹","🧙","🧚","🧛","🧜","🧝","🧞","🧟","🧌","💆","💇","🚶","🧍","🧎","🏃","💃","🕺","🕴️","👯","🧖","🧗","🤸","⛹️","🏋️","🚴","🚵","🤼","🤽","🤾","🤺","⛷️","🏂","🪂","🏄","🚣","🏊","🤿","🧘","🛀","🛌","👭","👫","👬","💏","💑","👪","👤","👥","🫂","👣","⌚","📱","💻","⌨️","🖥️","🖨️","🖱️","🖲️","🕹️","🗜️","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽️","🎞️","📞","☎️","📟","📠","📺","📻","🎙️","🎚️","🎛️","🧭","⏱️","⏲️","⏰","🕰️","⌛","📡","🔋","🪫","🔌","💡","🔦","🕯️","🪔","🧯","🗑️","🛢️","💸","💵","💴","💶","💷","🪙","💰","💳","💎","⚖️","🪜","🧰","🪛","🔧","🔨","⚒️","🛠️","⛏️","🪚","🔩","⚙️","🪤","🧱","⛓️","🧲","🔫","💣","🧨","🪓","🔪","🗡️","⚔️","🛡️","🚬","⚰️","🪦","⚱️","🏺","🔮","📿","🧿","🪬","💈","⚗️","🔭","🔬","🕳️","🩻","🩹","🩺","💊","💉","🩸","🧬","🦠","🧫","🧪","🌡️","🧹","🪠","🧺","🧻","🚽","🚰","🚿","🛁","🛀","🧼","🪥","🪒","🧽","🪣","🧴","🛎️","🔑","🗝️","🚪","🪑","🛋️","🛏️","🛌","🧸","🪆","🖼️","🪞","🪟","🛍️","🛒","🎁","🎈","🎏","🎀","🪄","🪅","🎊","🎉","🎎","🏮","🎐","🧧","✉️","📩","📨","📧","💌","📥","📤","📦","🏷️","📪","📫","📬","📭","📮","📯","📜","📃","📄","📑","🧾","📊","📈","📉","🗒️","🗓️","📆","📅","📇","🗃️","🗳️","🗄️","📋","📁","📂","🗂️","🗞️","📰","📓","📔","📒","📕","📗","📘","📙","📚","📖","🔖","🧷","🔗","📎","🖇️","📐","📏","🧮","📌","📍","✂️","🖊️","🖋️","✒️","🖌️","🖍️","📝","✏️","🔍","🔎","🔏","🔐","🔒","🔓","❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚕️","🆚","🈁","🈂️","🆙","🆒","🆕","🆓","🆖","🆗","🆙","🆒","🆕","🆓","🆖","🆗","🆘","🆚","🈁","🈂️","🈷️","🈶","🈯","🉐","🈹","🈚","🈲","🉑","🈸","🈴","🈳","㊗️","㊙️","🈺","🈵","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔺","🔻","🔸","🔹","🔶","🔷","🔳","🔲","▪️","▫️","◾","◽","◼️","◻️","🟥","🟧","🟨","🟩","🟦","🟪","⬛","⬜","🟫",
  ];
  const [todayMatches, setTodayMatches] = useState<any[]>([]);
  const [teamsMap, setTeamsMap] = useState<Map<string, Team>>(new Map());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchData = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;
    setUserId(auth.user.id);

    const [msgR, profR, teamsR, matchesR] = await Promise.all([
      supabase.from("messages").select("id, user_id, content, created_at").order("created_at", { ascending: true }).limit(200),
      supabase.from("profiles").select("id, display_name, avatar_url"),
      supabase.from("teams").select("id, name, flag_url"),
      supabase.from("matches").select("*").eq("phase", "group").order("kickoff_utc"),
    ]);

    if (teamsR.data) setTeamsMap(new Map(teamsR.data.map(t => [t.id, t])));

    if (profR.data && msgR.data) {
      const msgs = msgR.data.map(m => ({
        ...m,
        profiles: profR.data!.find(p => p.id === m.user_id) ?? null,
      }));
      setMessages(msgs);
    }

    if (matchesR.data) {
      const today = new Date();
      let dayMatches = matchesR.data.filter(m => sameDay(new Date(m.kickoff_utc), today));
      if (dayMatches.length === 0) {
        const firstDayStr = matchesR.data[0]?.kickoff_utc;
        if (firstDayStr) {
          dayMatches = matchesR.data.filter(m => sameDay(new Date(m.kickoff_utc), new Date(firstDayStr)));
        }
      }
      setTodayMatches(dayMatches);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchData();
    supabase.from("profiles").update({ last_chat_at: new Date().toISOString() }).eq("id", userId).then(() => {});
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!showEmojis) return;
    function handleClick(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmojis(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmojis]);

  const addEmoji = (emoji: string) => setInput(prev => prev + emoji);

  const send = async () => {
    if (!input.trim() || sending || !userId) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({ content: input.trim(), user_id: userId });
    if (!error) { setInput(""); await fetchData(); }
    else if (error.message.includes("bloqueada")) {
      setBlockedToast(true);
      clearTimeout(blockedTimer.current);
      blockedTimer.current = setTimeout(() => setBlockedToast(false), 3000);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex gap-6">
      {/* Left: Chat */}
      <div className="w-[520px] shrink-0">
        <h1 className="text-2xl font-semibold mb-4">Chat</h1>
        <div className="flex flex-col h-[700px] rounded-xl border bg-white overflow-hidden">
          <div className="border-b px-4 py-3">
            <p className="text-sm opacity-70">Converse com outros torcedores</p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm opacity-30 italic text-center pt-10">Nenhuma mensagem ainda. Seja o primeiro!</p>
            )}
            {messages.map(m => {
              const profile = m.user_id === userId && !m.profiles
                ? { display_name: "Você", avatar_url: null }
                : m.profiles ?? { display_name: "Usuário", avatar_url: null };
              const time = new Date(m.created_at);
              const diff = now - time.getTime();
              const timeStr = diff < 60000 ? "agora"
                : diff < 3600000 ? `${Math.floor(diff / 60000)}min`
                : diff < 86400000 ? `${Math.floor(diff / 3600000)}h`
                : time.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
              return (
                <div key={m.id} className={`flex gap-3 ${m.user_id === userId ? "flex-row-reverse" : ""}`}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                      {profile.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`max-w-[75%] ${m.user_id === userId ? "items-end" : ""}`}>
                    <div className={`flex items-baseline gap-2 ${m.user_id === userId ? "flex-row-reverse" : ""}`}>
                      <span className="text-xs font-semibold">{profile.display_name}</span>
                      <span className="text-[10px] opacity-40">{timeStr}</span>
                    </div>
                    <div className={`rounded-xl px-3 py-2 text-sm mt-0.5 ${
                      m.user_id === userId ? "bg-black text-white rounded-tr-sm" : "bg-gray-100 rounded-tl-sm"
                    }`}>{m.content}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          {blockedToast && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center gap-2 text-sm text-red-700">
              <span>🚫</span>
              <span>Mensagem bloqueada: conteúdo não permitido.</span>
            </div>
          )}
          <div className="border-t px-4 py-3 bg-white">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="Digite sua mensagem..."
                className="flex-1 rounded-lg border px-3 py-2 text-sm" />
              <div className="relative">
                <button onClick={() => setShowEmojis(!showEmojis)}
                  className="w-9 h-9 rounded-lg border flex items-center justify-center text-xl font-bold hover:bg-gray-50">
                  +
                </button>
                {showEmojis && (
                  <div ref={emojiRef} className="absolute bottom-full mb-2 right-0 w-[340px] h-[280px] overflow-y-auto rounded-xl border bg-white shadow-xl p-2 grid grid-cols-9 gap-0.5 z-50">
                    {emojis.map((e, i) => (
                      <button key={i} onClick={() => { addEmoji(e); }}
                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded">
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={send} disabled={sending || !input.trim()}
                className="rounded-lg bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800 disabled:opacity-30">
                {sending ? "..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Today's matches */}
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-semibold mb-4">Jogos de Hoje</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {todayMatches.length === 0 && (
            <p className="text-sm opacity-30 italic">Nenhum jogo hoje.</p>
          )}
          {todayMatches.map(m => {
            const home = teamsMap.get(m.home_team_id);
            const away = teamsMap.get(m.away_team_id);
            const kickoffMs = new Date(m.kickoff_utc).getTime();
            const status = matchStatus(kickoffMs, now);
            const showHome = m.real_home != null ? m.real_home : 0;
            const showAway = m.real_away != null ? m.real_away : 0;

            return (
              <div key={m.id} className="rounded-xl border bg-white overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b flex justify-between items-center">
                  <span className="text-xs font-semibold opacity-60">
                    {m.phase === "group" ? `Grupo ${m.group_code}` : m.phase.toUpperCase()}
                  </span>
                  <span className="text-xs opacity-50">{fmtBR(m.kickoff_utc)}</span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {home?.flag_url && <img src={home.flag_url} alt="" className="w-8 h-6 object-cover rounded shadow-sm shrink-0" />}
                      <span className="text-sm font-medium truncate">{home?.name ?? m.home_team_id}</span>
                    </div>
                    <span className="font-bold text-lg shrink-0">{showHome} x {showAway}</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-sm font-medium truncate">{away?.name ?? m.away_team_id}</span>
                      {away?.flag_url && <img src={away.flag_url} alt="" className="w-8 h-6 object-cover rounded shadow-sm shrink-0" />}
                    </div>
                  </div>

                  <div className={`text-sm font-semibold pt-3 text-center ${status.cls}`}>
                    {status.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
