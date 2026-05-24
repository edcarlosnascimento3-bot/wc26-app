import { PhaseMatches } from "@/components/PhaseMatches";

export default async function PartidasFasePage({
  params,
}: {
  params: Promise<{ fase: string }>;
}) {
  const { fase } = await params;
  return <PhaseMatches fase={fase} />;
}
