"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/partidas";

  useEffect(() => {
    if (!code) {
      router.replace("/login");
      return;
    }

    (async () => {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      router.replace(error ? "/login" : next);
    })();
  }, [code, next, router]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <p className="text-sm opacity-70">Entrando...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center p-6"><p className="text-sm opacity-70">Carregando...</p></div>}>
      <CallbackHandler />
    </Suspense>
  );
}
