"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  "Início":       <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 2.5L2.5 9H5v8h4v-4h2v4h4V9h2.5L10 2.5z"/></svg>,
  "Grupos":       <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zm6 0a3 3 0 100-6 3 3 0 000 6zM3 13.5A3.5 3.5 0 016.5 10h1A3.5 3.5 0 0111 13.5V15H3v-1.5zm8.5-1.5A3.5 3.5 0 018 13.5V15h9v-1.5A3.5 3.5 0 0013.5 10h-2z"/></svg>,
  "Palpites":     <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M17.924 2.617a.997.997 0 00-.215-.322l-.004-.004a.997.997 0 00-.322-.215c-.19-.076-.394-.076-.576-.076H3.193c-.182 0-.386 0-.576.076a1 1 0 00-.537.537 1.13 1.13 0 00-.076.577v13.62c0 .182 0 .386.076.576.06.149.145.287.258.399.112.112.25.197.398.258.19.076.394.076.576.076H8.5l2.5 3 2.5-3h3.307c.182 0 .386 0 .576-.076a.996.996 0 00.398-.258 1.067 1.067 0 00.258-.399c.076-.19.076-.394.076-.576V3.193c0-.182 0-.386-.076-.576zM10 14a.75.75 0 110-1.5.75.75 0 010 1.5zm1.5-4.736c-.5.348-.75.614-.75.986V11h-1.5v-.75c0-1.007.736-1.477 1.25-1.836.5-.348.75-.614.75-.986 0-.386-.5-.678-1.25-.678-.56 0-1.02.206-1.266.556l-.543-.812c.466-.64 1.17-.994 1.934-.994 1.326 0 2.25.688 2.25 1.928 0 1.007-.736 1.477-1.25 1.836z"/></svg>,
  "Partidas":     <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clipRule="evenodd"/></svg>,
  "Classificação":<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3 3a1 1 0 000 2h1v5a1 1 0 002 0V5h1a1 1 0 100-2H3zm7 0a1 1 0 000 2h1v12a1 1 0 102 0V5h1a1 1 0 100-2h-4zm5 0a1 1 0 100 2h1v8a1 1 0 102 0V5h1a1 1 0 100-2h-4z"/></svg>,
  "Estádios":     <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v2H6V4zm0 4h8v2H6V8zm0 4h5v2H6v-2z" clipRule="evenodd"/></svg>,
  "Escalações":   <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>,
  "Meus Campeões":<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 1a4 4 0 00-4 4v1H5a2 2 0 00-2 2v2a2 2 0 002 2h1.1a5.002 5.002 0 009.8 0H15a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a4 4 0 00-4-4zM8 5a2 2 0 114 0v1H8V5zm2 5a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd"/></svg>,
  "Pontuação":    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>,
  "Artilharia":   <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>,
  "Chaveamento":  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 003 5.5v2A2.5 2.5 0 005.5 10h2A2.5 2.5 0 0010 7.5v-2A2.5 2.5 0 007.5 3h-2zm0 10A2.5 2.5 0 003 15.5v2A2.5 2.5 0 005.5 20h2a2.5 2.5 0 002.5-2.5v-2A2.5 2.5 0 007.5 13h-2zm7.5-10a2.5 2.5 0 012.5 2.5v2a2.5 2.5 0 01-2.5 2.5h-2A2.5 2.5 0 0110 7.5v-2A2.5 2.5 0 0112.5 3h2z" clipRule="evenodd"/></svg>,
  "Chat":         <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd"/></svg>,
};

const faseSubmenus = [
  { label: "Fase de Grupos", fase: "group" },
  { label: "32 Ávos", fase: "r32" },
  { label: "Oitavas de Final", fase: "r16" },
  { label: "Quartas de Final", fase: "qf" },
  { label: "Semi Final", fase: "sf" },
  { label: "Final", fase: "final" },
];

function SidebarItem({ label, href, icon, isActive }: { label: string; href: string; icon: ReactNode; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        isActive ? "bg-black text-white" : "hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function SidebarInner() {
  const path = usePathname();

  const partidasSubmenus = faseSubmenus.map(f => ({
    label: f.label,
    href: `/partidas/${f.fase}`,
  }));

  const palpitesSubmenus = faseSubmenus.map(f => ({
    label: f.label,
    href: `/palpite/${f.fase}`,
  }));

  return (
    <>
      <SidebarItem label="Início" href="/" icon={icons["Início"]} isActive={path === "/"} />
      <SidebarItem label="Grupos" href="/grupos" icon={icons["Grupos"]} isActive={path === "/grupos"} />
      <SidebarGroupInner label="Palpites" icon={icons["Palpites"]} submenus={palpitesSubmenus} baseHref="/palpite" path={path} />
      <SidebarGroupInner label="Partidas" icon={icons["Partidas"]} submenus={partidasSubmenus} baseHref="/partidas" path={path} />
      <SidebarItem label="Classificação" href="/classificacao" icon={icons["Classificação"]} isActive={path === "/classificacao"} />
      <SidebarItem label="Estádios" href="/estadios" icon={icons["Estádios"]} isActive={path === "/estadios"} />
      <SidebarItem label="Escalações" href="/escalacoes" icon={icons["Escalações"]} isActive={path === "/escalacoes"} />
      <SidebarItem label="Meus Campeões" href="/meus-campeoes" icon={icons["Meus Campeões"]} isActive={path === "/meus-campeoes"} />
      <SidebarItem label="Pontuação" href="/pontuacao" icon={icons["Pontuação"]} isActive={path === "/pontuacao"} />
      <SidebarItem label="Artilharia" href="/artilharia" icon={icons["Artilharia"]} isActive={path === "/artilharia"} />
      <SidebarItem label="Chaveamento" href="/chaveamento" icon={icons["Chaveamento"]} isActive={path === "/chaveamento"} />
      <SidebarItem label="Chat" href="/chat" icon={icons["Chat"]} isActive={path === "/chat"} />
    </>
  );
}

function SidebarGroupInner({ label, icon, submenus, baseHref, path }: { label: string; icon: ReactNode; submenus: { label: string; href: string }[]; baseHref: string; path: string }) {
  const isActive = path === baseHref || submenus.some(s => path === s.href);

  return (
    <div className="group">
      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-default hover:bg-gray-100">
        {icon}
        {label}
      </div>
      <div className="ml-4 space-y-1 mt-1 hidden group-hover:block">
        {submenus.map(s => {
          const active = path === s.href;
          return (
            <Link
              key={s.href}
              href={s.href}
              className={`block rounded-lg px-3 py-1.5 text-xs transition-colors ${
                active ? "bg-black text-white" : "hover:bg-gray-100"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-60 border-r min-h-screen p-4 space-y-2 flex-shrink-0">
      <div className="font-bold text-lg mb-4">Copa 2026</div>
      <SidebarInner />
    </aside>
  );
}
