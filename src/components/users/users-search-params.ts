import { parseAsStringEnum } from "nuqs/server";
import {
  orderByParser,
  orderParser,
  pageParser,
  pageSizeParser,
  searchParser,
} from "@/components/data-table/data-table-base-search-params";

export { pageParser, pageSizeParser, searchParser, orderByParser, orderParser };

const USER_ROLES = ["admin", "user"] as const;

export const roleParser = parseAsStringEnum([...USER_ROLES]);
