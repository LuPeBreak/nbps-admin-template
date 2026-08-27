import { createParser, parseAsString, parseAsStringEnum } from "nuqs/server";
import {
  DATA_TABLE_MAX_PAGE,
  DATA_TABLE_MAX_PAGE_SIZE,
} from "./data-table-constants";

const MIN_PAGE_SIZE = 1;

function parseBoundedInteger(
  value: string,
  min: number,
  max: number,
): number | null {
  if (!/^-?\d+$/.test(value)) return null;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) return null;

  return Math.min(Math.max(parsed, min), max);
}

export const pageParser = createParser({
  parse: (value) => parseBoundedInteger(value, 1, DATA_TABLE_MAX_PAGE),
  serialize: (value) => String(value),
}).withDefault(1);

export const pageSizeParser = createParser({
  parse: (value) =>
    parseBoundedInteger(value, MIN_PAGE_SIZE, DATA_TABLE_MAX_PAGE_SIZE),
  serialize: (value) => String(value),
}).withDefault(15);

export const searchParser = parseAsString.withDefault("");
export const orderByParser = parseAsString.withDefault("");
export const orderParser = parseAsStringEnum(["asc", "desc"]).withDefault(
  "desc",
);
