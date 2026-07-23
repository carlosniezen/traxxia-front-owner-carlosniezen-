/**
 * Temporal period computation + Spanish labels for the standard horizons.
 * All math uses UTC date parts so a server in any timezone agrees on "today".
 */
import type { Horizon } from "@/lib/db/schema";

export type HorizonKind = Horizon["kind"];

const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
const DAYS_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export type Period = {
  kind: HorizonKind;
  label: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function utc(y: number, m: number, day: number): Date {
  return new Date(Date.UTC(y, m, day));
}

/** ISO-8601 week number (weeks start Monday). */
export function isoWeek(ref: Date): number {
  const d = utc(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate());
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = utc(d.getUTCFullYear(), 0, 4);
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return (
    1 +
    Math.round(
      (d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000),
    )
  );
}

export function yearPeriod(ref: Date): Period {
  const y = ref.getUTCFullYear();
  return {
    kind: "year",
    label: String(y),
    startDate: iso(utc(y, 0, 1)),
    endDate: iso(utc(y, 11, 31)),
  };
}

export function quarterPeriod(ref: Date): Period {
  const y = ref.getUTCFullYear();
  const q = Math.floor(ref.getUTCMonth() / 3); // 0..3
  const startMonth = q * 3;
  return {
    kind: "quarter",
    label: `Q${q + 1} ${y}`,
    startDate: iso(utc(y, startMonth, 1)),
    endDate: iso(utc(y, startMonth + 3, 0)),
  };
}

export function monthPeriod(ref: Date): Period {
  const y = ref.getUTCFullYear();
  const m = ref.getUTCMonth();
  return {
    kind: "month",
    label: `${MONTHS_LONG[m]} ${y}`,
    startDate: iso(utc(y, m, 1)),
    endDate: iso(utc(y, m + 1, 0)),
  };
}

export function weekPeriod(ref: Date): Period {
  const d = utc(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate());
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - dayNum);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const wk = isoWeek(ref);
  const label = `Sem ${wk} · ${monday.getUTCDate()}–${sunday.getUTCDate()} ${MONTHS_SHORT[sunday.getUTCMonth()]}`;
  return {
    kind: "week",
    label,
    startDate: iso(monday),
    endDate: iso(sunday),
  };
}

export function dayPeriod(ref: Date): Period {
  const d = utc(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate());
  const label = `${DAYS_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
  return {
    kind: "day",
    label,
    startDate: iso(d),
    endDate: iso(d),
  };
}

/** The five standard horizons auto-created at onboarding, in order. */
export function standardPeriods(ref: Date = new Date()): Period[] {
  return [
    yearPeriod(ref),
    quarterPeriod(ref),
    monthPeriod(ref),
    weekPeriod(ref),
    dayPeriod(ref),
  ];
}

/** Long, human date for the Hoy header, e.g. "miércoles 23 de julio de 2026". */
export function longSpanishDate(ref: Date = new Date()): string {
  const daysLong = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];
  const d = utc(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate());
  return `${daysLong[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS_LONG[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}
