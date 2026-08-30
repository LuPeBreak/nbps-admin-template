import { describe, expect, it } from "vitest";
import {
  orderParser,
  pageParser,
  pageSizeParser,
} from "./data-table-base-search-params";
import {
  DATA_TABLE_MAX_PAGE,
  DATA_TABLE_MAX_PAGE_SIZE,
} from "./data-table-constants";

describe("data table base search params", () => {
  it("applies defaults when pagination values are missing or malformed", () => {
    expect(pageParser.parseServerSide(undefined)).toBe(1);
    expect(pageParser.parseServerSide("12invalid")).toBe(1);
    expect(pageSizeParser.parseServerSide(undefined)).toBe(15);
    expect(pageSizeParser.parseServerSide("2.5")).toBe(15);
  });

  it("clamps pagination values to defensive bounds", () => {
    expect(pageParser.parseServerSide("0")).toBe(1);
    expect(pageParser.parseServerSide(String(DATA_TABLE_MAX_PAGE + 1))).toBe(
      DATA_TABLE_MAX_PAGE,
    );
    expect(pageSizeParser.parseServerSide("0")).toBe(1);
    expect(
      pageSizeParser.parseServerSide(String(DATA_TABLE_MAX_PAGE_SIZE + 1)),
    ).toBe(DATA_TABLE_MAX_PAGE_SIZE);
  });

  it("accepts only supported sort directions", () => {
    expect(orderParser.parseServerSide("asc")).toBe("asc");
    expect(orderParser.parseServerSide("desc")).toBe("desc");
    expect(orderParser.parseServerSide("sideways")).toBe("desc");
  });
});
