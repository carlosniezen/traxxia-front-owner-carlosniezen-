"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { DIMENSIONS } from "@/lib/dimensions";

/** S.T.R.A.T.E.G.I.C. radar over the 9 dimensions (0–100). */
export function StrategicRadar({
  scores,
}: {
  scores: Record<string, number>;
}) {
  const data = DIMENSIONS.map((d) => ({
    axis: d.nameEs,
    score: scores[d.id] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#2A2F38" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#C9C3B8", fontSize: 12 }}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          dataKey="score"
          stroke="#B8451F"
          fill="#B8451F"
          fillOpacity={0.35}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
