"use client";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";

function LoginForm() {
  const supabase = supabaseBrowser();
  const next = useSearchParams().get("next") || "/partidas";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function signInMagicLink(e: FormEvent) {
    e.preventDefault();
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
      },
    });
    if (err) return setError(err.message);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 space-y-4 shadow-sm text-center">
          <h1 className="text-2xl font-bold">Link enviado!</h1>
          <p className="text-sm opacity-70">Verifique seu email {email} para acessar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 md:px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 md:p-8 space-y-6 shadow-sm mx-4 md:mx-0">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Copa 2026</h1>
          <p className="text-sm opacity-70">Entre com seu email</p>
        </div>
        <form onSubmit={signInMagicLink} className="space-y-4">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-black text-white px-4 py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            Enviar link mágico
          </button>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </form>
        <p className="text-xs opacity-50 text-center">
          Voc&ecirc; receber&aacute; um link de acesso por email
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center p-6"><p>Carregando...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
