import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", auth.user.id)
    .single();

  return NextResponse.json({
    display_name: data?.display_name ?? auth.user.email?.split("@")[0] ?? "",
    avatar_url: data?.avatar_url ?? null,
  });
}

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const displayName = form.get("display_name") as string | null;
  const avatarFile = form.get("avatar") as File | null;

  if (displayName) {
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("display_name", displayName)
      .neq("id", auth.user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "nome_duplicado", message: "Esse nome já está cadastrado, por favor escolha outro" }, { status: 409 });
    }
  }

  let avatarUrl: string | null = null;

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() ?? "png";
    const timestamp = Date.now();
    const filePath = `${auth.user.id}_${timestamp}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filePath, avatarFile);

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

    const { data: publicUrl } = supabaseAdmin.storage.from("avatars").getPublicUrl(filePath);
    avatarUrl = publicUrl.publicUrl;
  }

  const updates: Record<string, any> = {};
  if (displayName) updates.display_name = displayName;
  if (avatarUrl) updates.avatar_url = avatarUrl;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: auth.user.id, ...updates }, { onConflict: "id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, display_name: displayName, avatar_url: avatarUrl });
}
