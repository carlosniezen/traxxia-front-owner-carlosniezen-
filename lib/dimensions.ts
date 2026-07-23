/**
 * The 9 dimensions of the personal S.T.R.A.T.E.G.I.C. framework.
 * This is the single source of truth used by the DB seed and by any UI that
 * needs the canonical list before the DB is queried. Values match the spec §6
 * exactly. Note: two "T" letters — `T1` (Tiempo) and `T2` (Talento) — are
 * differentiated by id in the DB but both render the letter "T".
 */
export type DimensionSeed = {
  id: string;
  letter: string;
  nameEs: string;
  nameEn: string;
  blurbEs: string;
  blurbEn: string;
  color: string;
  orderIndex: number;
};

export const DIMENSIONS: DimensionSeed[] = [
  {
    id: "S",
    letter: "S",
    nameEs: "Sentido",
    nameEn: "Sense",
    blurbEs: "Propósito y dirección de vida",
    blurbEn: "Life purpose and direction",
    color: "#B8451F",
    orderIndex: 0,
  },
  {
    id: "T1",
    letter: "T",
    nameEs: "Tiempo",
    nameEn: "Time",
    blurbEs: "Asignación del recurso más finito",
    blurbEn: "Allocation of the most finite resource",
    color: "#D4A574",
    orderIndex: 1,
  },
  {
    id: "R",
    letter: "R",
    nameEs: "Relaciones",
    nameEn: "Relationships",
    blurbEs: "Capital personal: pareja, hijos, red",
    blurbEn: "Personal capital: partner, children, network",
    color: "#E08B6F",
    orderIndex: 2,
  },
  {
    id: "A",
    letter: "A",
    nameEs: "Autoconocimiento",
    nameEn: "Awareness",
    blurbEs: "Datos honestos sobre uno mismo",
    blurbEn: "Honest data about yourself",
    color: "#5EAE8A",
    orderIndex: 3,
  },
  {
    id: "T2",
    letter: "T",
    nameEs: "Talento",
    nameEn: "Talent",
    blurbEs: "Capacidades duras y blandas acumuladas",
    blurbEn: "Accumulated hard and soft capabilities",
    color: "#9B7EBD",
    orderIndex: 4,
  },
  {
    id: "E",
    letter: "E",
    nameEs: "Energía",
    nameEn: "Energy",
    blurbEs: "Física, mental, emocional",
    blurbEn: "Physical, mental, emotional",
    color: "#C97560",
    orderIndex: 5,
  },
  {
    id: "G",
    letter: "G",
    nameEs: "Gobierno",
    nameEn: "Governance",
    blurbEs: "Board personal: mentores, pareja, consejeros",
    blurbEn: "Personal board: mentors, partner, advisors",
    color: "#5B8FA8",
    orderIndex: 6,
  },
  {
    id: "I",
    letter: "I",
    nameEs: "Innovación",
    nameEn: "Innovation",
    blurbEs: "Aprender, experimentar, crecer",
    blurbEn: "Learn, experiment, grow",
    color: "#7BA7C4",
    orderIndex: 7,
  },
  {
    id: "C",
    letter: "C",
    nameEs: "Carácter",
    nameEn: "Character",
    blurbEs: "Valores demostrados en decisiones",
    blurbEn: "Values demonstrated in decisions",
    color: "#B5A98C",
    orderIndex: 8,
  },
];
