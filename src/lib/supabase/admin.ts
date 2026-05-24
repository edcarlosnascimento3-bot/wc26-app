import { supabaseServer } from "./server";

export async function isAdmin() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;

  const { data } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  return !!data;
}
