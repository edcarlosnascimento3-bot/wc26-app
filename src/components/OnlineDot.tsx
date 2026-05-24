"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function OnlineDot({ lastSeenAt, userId }: { lastSeenAt: string | null; userId: string }) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabaseBrowser().auth.getUser();
      if (user?.id === userId) {
        setOnline(true);
        return;
      }
      setOnline(lastSeenAt ? Date.now() - new Date(lastSeenAt).getTime() < 120000 : false);
    }
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [lastSeenAt, userId]);

  return (
    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${online ? 'bg-green-500' : 'bg-red-600'}`} />
  );
}
