import { createParser, parseAsString, parseAsStringEnum } from "nuqs/server";

// Bounds defensivos: evitam abuso via URL (ex.: ?pageSize=100000 DDoS do banco).
const MAX_PAGE = 100000;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

function clampInt(raw: number, min: number, max: number): number | null {
  if (Number.isNaN(raw)) return null;
  return Math.min(Math.max(Math.trunc(raw), min), max);
}

export const pageParser = createParser({
  parse: (value) => clampInt(Number.parseInt(value, 10), 1, MAX_PAGE),
  serialize: (value) => String(value),
}).withDefault(1);

export const pageSizeParser = createParser({
  parse: (value) =>
    clampInt(Number.parseInt(value, 10), MIN_PAGE_SIZE, MAX_PAGE_SIZE),
  serialize: (value) => String(value),
}).withDefault(15);

export const searchParser = parseAsString.withDefault("");
export const orderByParser = parseAsString.withDefault("");
export const orderParser = parseAsStringEnum(["asc", "desc"]).withDefault(
  "asc",
);
