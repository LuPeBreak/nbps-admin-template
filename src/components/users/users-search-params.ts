import { parseAsString } from "nuqs/server";
import {
  orderByParser,
  orderParser,
  pageParser,
  pageSizeParser,
  searchParser,
} from "@/components/data-table/data-table-base-search-params";

export { pageParser, pageSizeParser, searchParser, orderByParser, orderParser };

export const roleParser = parseAsString.withDefault("");
