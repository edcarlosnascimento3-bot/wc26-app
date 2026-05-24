import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchWC, normalizePhase } from "@/lib/wc/ingest";

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { teams, venues, matches } = await fetchWC();

    await supabase.from("venues").upsert(
      venues.map(v => ({
        id: v.id,
        name: v.name,
        city: v.city ?? null,
        country: v.country ?? null,
        lat: v.lat ?? null,
        lng: v.lng ?? null,
        photo_url: v.photo ?? null
      })),
      { onConflict: "id" }
    );

    await supabase.from("teams").upsert(
      teams.map(t => ({
        id: t.code,
        name: t.name,
        code: t.code,
        flag_url: t.flag ?? null,
        group_code: t.group ?? null
      })),
      { onConflict: "id" }
    );

    await supabase.from("matches").upsert(
      matches.map(m => ({
        id: String(m.num),
        match_number: m.num,
        phase: normalizePhase(m.phase),
        group_code: m.group ?? null,
        kickoff_utc: m.datetime_utc,
        venue_id: m.venue ?? null,
        home_team_id: m.home,
        away_team_id: m.away,
        status: m.status ?? "scheduled",
        real_home: m.home_score ?? null,
        real_away: m.away_score ?? null,
        updated_at: new Date().toISOString()
      })),
      { onConflict: "id" }
    );

    await supabase.from("audit_log").insert({
      user_id: null,
      action: "sync",
      entity: "wc26",
      entity_id: "wheniskickoff",
      after: { teams: teams.length, venues: venues.length, matches: matches.length }
    });

    return NextResponse.json({
      ok: true,
      summary: { teams: teams.length, venues: venues.length, matches: matches.length }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
