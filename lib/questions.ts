/**
 * S.T.R.A.T.E.G.I.C. diagnostic — 27 questions, 3 per dimension.
 * Likert scale 1–5 (1 = totalmente en desacuerdo, 5 = totalmente de acuerdo).
 * Question ids are stable (used as keys in diagnostics.answers).
 */
export type Question = {
  id: string;
  dimensionId: string;
  text: string;
};

export const LIKERT_LABELS_ES = [
  "Totalmente en desacuerdo",
  "En desacuerdo",
  "Neutral",
  "De acuerdo",
  "Totalmente de acuerdo",
];

export const QUESTIONS: Question[] = [
  // Sentido
  {
    id: "S1",
    dimensionId: "S",
    text: "Podría explicar mi propósito de vida en una sola línea sin dudar.",
  },
  {
    id: "S2",
    dimensionId: "S",
    text: "Cuando tomo decisiones importantes, las evalúo contra mi propósito.",
  },
  {
    id: "S3",
    dimensionId: "S",
    text: "Mis próximos 5 años tienen una dirección clara para mí.",
  },
  // Tiempo
  {
    id: "T1-1",
    dimensionId: "T1",
    text: "Mi calendario refleja fielmente mis prioridades reales.",
  },
  {
    id: "T1-2",
    dimensionId: "T1",
    text: "Protejo bloques de tiempo para lo importante antes que para lo urgente.",
  },
  {
    id: "T1-3",
    dimensionId: "T1",
    text: "Rara vez termino la semana sintiendo que el tiempo se me fue sin control.",
  },
  // Relaciones
  {
    id: "R1",
    dimensionId: "R",
    text: "Dedico tiempo intencional y de calidad a las personas que más me importan.",
  },
  {
    id: "R2",
    dimensionId: "R",
    text: "Mi pareja y familia dirían que estoy presente, no solo disponible.",
  },
  {
    id: "R3",
    dimensionId: "R",
    text: "Cultivo activamente una red de relaciones que me nutre y me reta.",
  },
  // Autoconocimiento
  {
    id: "A1",
    dimensionId: "A",
    text: "Conozco con honestidad mis fortalezas y mis puntos ciegos.",
  },
  {
    id: "A2",
    dimensionId: "A",
    text: "Busco y recibo feedback incómodo sin ponerme a la defensiva.",
  },
  {
    id: "A3",
    dimensionId: "A",
    text: "Entiendo qué me energiza y qué me drena en mi día a día.",
  },
  // Talento
  {
    id: "T2-1",
    dimensionId: "T2",
    text: "Estoy desarrollando deliberadamente las capacidades que necesitaré en 5 años.",
  },
  {
    id: "T2-2",
    dimensionId: "T2",
    text: "Delego o elimino aquello en lo que no soy ni debo ser el mejor.",
  },
  {
    id: "T2-3",
    dimensionId: "T2",
    text: "Mi trabajo aprovecha lo mejor de mis talentos la mayor parte del tiempo.",
  },
  // Energía
  {
    id: "E1",
    dimensionId: "E",
    text: "Cuido mi energía física (sueño, movimiento, alimentación) de forma consistente.",
  },
  {
    id: "E2",
    dimensionId: "E",
    text: "Gestiono mi energía mental y emocional, no solo mi tiempo.",
  },
  {
    id: "E3",
    dimensionId: "E",
    text: "Termino la mayoría de mis días con energía suficiente para lo que importa.",
  },
  // Gobierno
  {
    id: "G1",
    dimensionId: "G",
    text: 'Tengo un "board personal" de mentores o consejeros a quienes consulto.',
  },
  {
    id: "G2",
    dimensionId: "G",
    text: "Existen personas que pueden decirme una verdad difícil y las escucho.",
  },
  {
    id: "G3",
    dimensionId: "G",
    text: "Reviso mis decisiones importantes con alguien antes de ejecutarlas.",
  },
  // Innovación
  {
    id: "I1",
    dimensionId: "I",
    text: "Reservo tiempo para aprender y experimentar con lo nuevo.",
  },
  {
    id: "I2",
    dimensionId: "I",
    text: "Salgo con frecuencia de mi zona de confort de forma deliberada.",
  },
  {
    id: "I3",
    dimensionId: "I",
    text: "En el último año adopté una idea o práctica que cambió cómo opero.",
  },
  // Carácter
  {
    id: "C1",
    dimensionId: "C",
    text: "Mis decisiones bajo presión son coherentes con mis valores declarados.",
  },
  {
    id: "C2",
    dimensionId: "C",
    text: "Cumplo los compromisos que hago, incluso cuando ya no me conviene.",
  },
  {
    id: "C3",
    dimensionId: "C",
    text: "Las personas que me conocen confiarían en mí para algo importante.",
  },
];
