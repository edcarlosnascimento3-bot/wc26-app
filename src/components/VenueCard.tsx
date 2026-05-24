"use client";
import { useState } from "react";

type Props = {
  venue: {
    id: string;
    name: string;
    city?: string;
    country?: string;
    capacity?: number;
    photo_url?: string;
    lat?: number;
    lng?: number;
    meta?: any;
  };
};

export function VenueCard({ venue }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="rounded-xl border overflow-hidden bg-white cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
          {venue.photo_url ? (
            <img src={venue.photo_url} alt={venue.name} className="w-full h-full object-cover" />
          ) : (
            "🏟️ Sem foto"
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold">{venue.name}</h3>
          <p className="text-sm opacity-70">{venue.city}{venue.country ? `, ${venue.country}` : ""}</p>
          {venue.capacity && (
            <p className="text-xs opacity-60">Capacidade: {venue.capacity.toLocaleString()}</p>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-3 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold">{venue.name}</h2>
              <button onClick={() => setOpen(false)} className="text-2xl leading-none">&times;</button>
            </div>
            {venue.photo_url && (
              <img src={venue.photo_url} alt={venue.name} className="w-full h-48 object-cover rounded-xl" />
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="opacity-60">Cidade:</span> {venue.city ?? "—"}</div>
              <div><span className="opacity-60">País:</span> {venue.country ?? "—"}</div>
              <div><span className="opacity-60">Capacidade:</span> {venue.capacity?.toLocaleString() ?? "—"}</div>
              <div><span className="opacity-60">Latitude:</span> {venue.lat ?? "—"}</div>
              <div><span className="opacity-60">Longitude:</span> {venue.lng ?? "—"}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
