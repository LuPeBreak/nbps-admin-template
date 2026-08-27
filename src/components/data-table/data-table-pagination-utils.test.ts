import { describe, expect, it } from "vitest";
import { getPaginationRange } from "./data-table-pagination-utils";

describe("getPaginationRange", () => {
  it("represents an empty result without an inverted range", () => {
    expect(
      getPaginationRange({
        page: 1,
        pageCount: 0,
        pageSize: 15,
        totalCount: 0,
      }),
    ).toEqual({ currentPage: 1, endItem: 0, safePageCount: 1, startItem: 0 });
  });

  it("clamps a page beyond the result set to the last page", () => {
    expect(
      getPaginationRange({
        page: 99,
        pageCount: 3,
        pageSize: 15,
        totalCount: 31,
      }),
    ).toEqual({ currentPage: 3, endItem: 31, safePageCount: 3, startItem: 31 });
  });
});
