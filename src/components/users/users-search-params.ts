import { parseAsStringEnum } from "nuqs/server";
import {
  orderByParser,
  orderParser,
  pageParser,
  pageSizeParser,
  searchParser,
} from "@/components/data-table/data-table-base-search-params";
import { DATA_TABLE_MAX_SEARCH_LENGTH } from "@/components/data-table/data-table-constants";

export { pageParser, pageSizeParser, searchParser, orderByParser, orderParser };

const USER_ROLES = ["admin", "user"] as const;

export const roleParser = parseAsStringEnum([...USER_ROLES]);

export function normalizeUsersSearch(value: string) {
  return value.slice(0, DATA_TABLE_MAX_SEARCH_LENGTH);
}
