import { QUESTIONS } from "@/lib/questions";
import { DIMENSIONS } from "@/lib/dimensions";

export type DiagnosticResult = {
  scores: Record<string, number>; // dimensionId -> 0..100
  overall: number;
  strengths: { dimensionId: string; score: number }[];
  gaps: { dimensionId: string; score: number }[];
};

/** Maps a Likert answer set to per-dimension 0–100 scores + strengths/gaps. */
export function computeDiagnostic(
  answers: Record<string, number>,
): DiagnosticResult {
  const scores: Record<string, number> = {};

  for (const dim of DIMENSIONS) {
    const qs = QUESTIONS.filter((q) => q.dimensionId === dim.id);
    const vals = qs
      .map((q) => answers[q.id])
      .filter((v): v is number => typeof v === "number" && v >= 1 && v <= 5);
    if (vals.length === 0) {
      scores[dim.id] = 0;
      continue;
    }
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    scores[dim.id] = Math.round(((avg - 1) / 4) * 100);
  }

  const ranked = DIMENSIONS.map((d) => ({
    dimensionId: d.id,
    score: scores[d.id] ?? 0,
  })).sort((a, b) => b.score - a.score);

  const overall = Math.round(
    ranked.reduce((a, r) => a + r.score, 0) / (ranked.length || 1),
  );

  return {
    scores,
    overall,
    strengths: ranked.slice(0, 3),
    gaps: [...ranked].reverse().slice(0, 3),
  };
}

/** True once every question has a valid answer. */
export function isComplete(answers: Record<string, number>): boolean {
  return QUESTIONS.every((q) => {
    const v = answers[q.id];
    return typeof v === "number" && v >= 1 && v <= 5;
  });
}
