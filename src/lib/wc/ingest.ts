import { z } from "zod";

const Base = "https://wheniskickoff.com/data/v1";

const Wrapper = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ meta: z.any().optional(), count: z.number().optional(), data });

const TeamsSchema = Wrapper(z.array(z.object({
  code: z.string(),
  name: z.string(),
  flag: z.string().optional(),
  group: z.string().optional()
})));

const VenuesSchema = Wrapper(z.array(z.object({
  id: z.string(),
  name: z.string(),
  city: z.string().optional(),
  country: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  photo: z.string().optional()
})));

const MatchesSchema = Wrapper(z.array(z.object({
  num: z.number(),
  datetime_utc: z.string(),
  phase: z.string(),
  group: z.string().optional(),
  home: z.string(),
  away: z.string(),
  venue: z.string().optional(),
  status: z.string().optional(),
  home_score: z.number().optional().nullable(),
  away_score: z.number().optional().nullable()
})));

export function normalizePhase(phase: string): "group"|"r32"|"r16"|"qf"|"sf"|"3p"|"final" {
  const p = phase.toLowerCase();
  if (p.includes("group")) return "group";
  if (p.includes("32")) return "r32";
  if (p.includes("16")) return "r16";
  if (p.includes("quarter") || p.includes("qf")) return "qf";
  if (p.includes("semi") || p.includes("sf")) return "sf";
  if (p.includes("third") || p.includes("3rd") || p.includes("3p")) return "3p";
  if (p.includes("final")) return "final";
  return "group";
}

export async function fetchWC() {
  const [teamsR, venuesR, matchesR] = await Promise.all([
    fetch(`${Base}/teams.json`, { cache: "no-store" }),
    fetch(`${Base}/venues.json`, { cache: "no-store" }),
    fetch(`${Base}/matches.json`, { cache: "no-store" })
  ]);
  const teams = TeamsSchema.parse(await teamsR.json()).data;
  const venues = VenuesSchema.parse(await venuesR.json()).data;
  const matches = MatchesSchema.parse(await matchesR.json()).data;
  return { teams, venues, matches };
}
