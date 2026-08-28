import { describe, expect, it } from "vitest";
import {
  getEffectivePage,
  getPaginationRange,
} from "./data-table-pagination-utils";

describe("getEffectivePage", () => {
  it("normalizes an out-of-range page to the last valid page", () => {
    expect(getEffectivePage(99, 3)).toBe(3);
  });

  it("keeps empty results on page one", () => {
    expect(getEffectivePage(99, 0)).toBe(1);
  });
});

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
