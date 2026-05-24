export function scorePrediction(realH: number|null, realA: number|null, predH: number|null, predA: number|null) {
  if (realH == null || realA == null || predH == null || predA == null) return 0;
  if (realH === predH && realA === predA) return 5;

  const realOutcome = realH === realA ? "D" : realH > realA ? "H" : "A";
  const predOutcome = predH === predA ? "D" : predH > predA ? "H" : "A";
  return realOutcome === predOutcome ? 3 : 0;
}
