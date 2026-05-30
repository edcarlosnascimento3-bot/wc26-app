"use client";
import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const CROP_BOX = 280;

export function TopBar() {
  const supabase = supabaseBrowser();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const [cropImg, setCropImg] = useState<string | null>(null);
  const [cropNatural, setCropNatural] = useState({ w: 0, h: 0 });
  const [cropPct, setCropPct] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, pctX: 50, pctY: 50 });

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/profile");
        if (r.ok) {
          const data = await r.json();
          setDisplayName(data.display_name);
          setAvatarUrl(data.avatar_url);
          setEditName(data.display_name);
        }
      } catch {}
    })();
    const id = setInterval(() => {
      fetch("/api/heartbeat", { method: "POST" }).catch(() => console.warn("heartbeat failed"));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowForm(false);
        setCropImg(null);
      }
    }
    if (showForm) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showForm]);

  useEffect(() => {
    if (!dragging) return;
    function onMove(e: MouseEvent) {
      const rect = cropContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const imgScale = Math.max(rect.width / cropNatural.w, rect.height / cropNatural.h);
      const excessW = Math.max(0, cropNatural.w * imgScale - rect.width);
      const excessH = Math.max(0, cropNatural.h * imgScale - rect.height);
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      setCropPct({
        x: excessW > 0
          ? Math.max(0, Math.min(100, dragRef.current.pctX - (dx / excessW) * 100))
          : 50,
        y: excessH > 0
          ? Math.max(0, Math.min(100, dragRef.current.pctY - (dy / excessH) * 100))
          : 50,
      });
    }
    function onUp() { setDragging(false); }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, [dragging, cropNatural]);

  async function logout() {
    await supabase.auth.signOut();
    location.href = "/login";
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setCropImg(url);
      setCropPct({ x: 50, y: 50 });
      const img = new Image();
      img.onload = () => setCropNatural({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function handleCropStart(e: React.MouseEvent) {
    if (!cropNatural.w) return;
    setDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, pctX: cropPct.x, pctY: cropPct.y };
  }

  async function confirmSave() {
    setSaving(true);
    const formData = new FormData();
    formData.append("display_name", editName);

    if (cropImg && cropNatural.w) {
      const img = new Image();
      img.src = cropImg;
      await new Promise(r => { img.onload = r; });

      const container = cropContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const containerW = rect.width;
      const containerH = rect.height;

      const box = 200;
      const canvas = document.createElement("canvas");
      canvas.width = box;
      canvas.height = box;
      const ctx = canvas.getContext("2d")!;

      const imgScale = Math.max(containerW / cropNatural.w, containerH / cropNatural.h);
      const renderW = cropNatural.w * imgScale;
      const renderH = cropNatural.h * imgScale;
      const excessW = Math.max(0, renderW - containerW);
      const excessH = Math.max(0, renderH - containerH);

      const sourceX = (excessW * cropPct.x / 100) / imgScale;
      const sourceY = (excessH * cropPct.y / 100) / imgScale;
      const sourceW = containerW / imgScale;
      const sourceH = containerH / imgScale;

      ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, box, box);

      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/png"));
      if (blob) {
        const croppedFile = new File([blob], "avatar.png", { type: "image/png" });
        formData.append("avatar", croppedFile);
      }
      setCropImg(null);
    } else if (fileRef.current?.files?.[0]) {
      formData.append("avatar", fileRef.current.files[0]);
    }

    try {
      const r = await fetch("/api/profile", { method: "POST", body: formData });
      const data = await r.json();
      if (r.ok) {
        setDisplayName(data.display_name ?? editName);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
        setShowForm(false);
      } else if (data.error === "nome_duplicado") {
        alert(data.message);
      } else {
        alert("Erro ao salvar: " + (data.error ?? "desconhecido"));
      }
    } catch (e: any) {
      alert("Erro de rede: " + e.message);
    }
    setSaving(false);
  }

  return (
    <header className="relative h-20 border-b flex items-center justify-end px-4 gap-4">
      {displayName && (
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-0.5">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover border" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={() => setShowForm(!showForm)}
                    className="text-xs font-bold text-red-600 hover:underline leading-none">
              Editar
            </button>
          </div>
          <span className="text-sm font-medium">{displayName}</span>
        </div>
      )}

      <button onClick={logout} className="text-sm rounded-lg border px-3 py-1 hover:bg-gray-50">
        Sair
      </button>

      {showForm && (
        <div ref={formRef} className="absolute top-full mt-2 right-4 w-80 rounded-xl border bg-white shadow-xl p-5 space-y-4 z-50">
          <h3 className="font-semibold text-sm pb-3 border-b">Editar perfil</h3>

          <div className="space-y-1">
            <label className="text-xs font-medium opacity-70">Faça upload de sua foto</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect}
              className="w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs hover:file:bg-gray-200" />
          </div>

          {cropImg && (
            <div className="space-y-2">
              <p className="text-xs font-medium opacity-70">Ajuste o enquadramento:</p>
              <div ref={cropContainerRef}
                onMouseDown={handleCropStart}
                className="w-[280px] aspect-square rounded-lg overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100 mx-auto"
              >
                {cropNatural.w > 0 && (
                  <img src={cropImg} alt="" draggable={false}
                    className="w-full h-full pointer-events-none select-none"
                    style={{ objectFit: "cover", objectPosition: `${cropPct.x}% ${cropPct.y}%` }} />
                )}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium opacity-70">Como deseja ser chamado</label>
            <input type="text" value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={() => { setShowForm(false); setCropImg(null); }}
              className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={confirmSave} disabled={saving || !editName.trim()}
              className="flex-1 rounded-lg bg-black text-white px-3 py-2 text-sm font-semibold hover:bg-gray-800 disabled:opacity-30">
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
