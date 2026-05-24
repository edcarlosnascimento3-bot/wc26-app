import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const Body = z.object({
  matchId: z.string(),
  predHome: z.number().int().min(0).nullable(),
  predAway: z.number().int().min(0).nullable()
});

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = Body.parse(await req.json());

  const before = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", auth.user.id)
    .eq("match_id", body.matchId)
    .maybeSingle();

  const { data, error } = await supabase
    .from("predictions")
    .upsert({
      user_id: auth.user.id,
      match_id: body.matchId,
      pred_home: body.predHome,
      pred_away: body.predAway,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id,match_id" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("audit_log").insert({
    user_id: auth.user.id,
    action: "prediction_upsert",
    entity: "prediction",
    entity_id: body.matchId,
    before: before.data ?? null,
    after: data
  });

  return NextResponse.json({ ok: true, prediction: data });
}
