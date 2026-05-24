"use client";
import { useState } from "react";

const POSITIONS: Record<string, string> = {
  GK: "Goleiro", DF: "Defensor", MF: "Meio-campista", FW: "Atacante",
};

const COLORS = [
  "#1e40af", "#dc2626", "#059669", "#d97706", "#7c3aed", "#db2777",
  "#0891b2", "#ca8a04", "#4f46e5", "#be123c", "#0d9488", "#a21caf",
];

function getInitials(name: string) {
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

type Player = {
  id: string;
  name: string;
  shirt_number: number;
  position: string;
  photo_url?: string | null;
};

export function PlayerCarousel({ players }: { players: Player[] }) {
  const [active, setActive] = useState(0);

  if (players.length === 0) return null;

  const prev = () => setActive(a => (a - 1 + players.length) % players.length);
  const next = () => setActive(a => (a + 1) % players.length);

  const current = players[active];

  const getVisible = () => {
    const total = players.length;
    const result: { player: Player; idx: number; offset: number }[] = [];
    for (let i = -2; i <= 2; i++) {
      const idx = (active + i + total) % total;
      result.push({ player: players[idx], idx, offset: i });
    }
    return result;
  };

  const visible = getVisible();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="relative flex items-center justify-center h-72 sm:h-80">
        {visible.map(({ player, idx, offset }) => {
          const isCenter = offset === 0;
          const scale = isCenter ? 1.3 : 0.65;
          const opacity = isCenter ? 1 : 0.3;
          const z = isCenter ? 10 : 5 - Math.abs(offset);
          const translateX = offset * 130;
          const color = COLORS[idx % COLORS.length];
          return (
            <div
              key={idx}
              onClick={() => setActive(idx)}
              className="absolute transition-all duration-300 cursor-pointer"
              style={{
                transform: `translateX(${translateX}px) scale(${scale})`,
                opacity,
                zIndex: z,
              }}
            >
              <div className="relative">
                <img
                  src={player.photo_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(player.name) + "&size=200&background=" + color.slice(1) + "&color=fff&bold=true"}
                  alt={player.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-xl border-4 border-white object-cover"
                />
                {isCenter && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    #{player.shirt_number}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6">
        <button onClick={prev} className="rounded-full bg-gray-800 hover:bg-gray-700 text-white w-12 h-12 flex items-center justify-center text-xl font-bold transition-all shadow-md hover:scale-105">&larr;</button>
        <div className="text-center min-w-48">
          <p className="font-bold text-xl">{current.name}</p>
          <p className="text-sm opacity-60 mt-0.5">
            {POSITIONS[current.position] ?? current.position} &middot; Camisa #{current.shirt_number}
          </p>
        </div>
        <button onClick={next} className="rounded-full bg-gray-800 hover:bg-gray-700 text-white w-12 h-12 flex items-center justify-center text-xl font-bold transition-all shadow-md hover:scale-105">&rarr;</button>
      </div>
    </div>
  );
}
