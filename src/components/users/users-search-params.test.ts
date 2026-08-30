import { describe, expect, it } from "vitest";
import { DATA_TABLE_MAX_SEARCH_LENGTH } from "@/components/data-table/data-table-constants";
import { normalizeUsersSearch, roleParser } from "./users-search-params";

describe("users search params", () => {
  it("accepts only supported user roles", () => {
    expect(roleParser.parseServerSide("admin")).toBe("admin");
    expect(roleParser.parseServerSide("user")).toBe("user");
    expect(roleParser.parseServerSide("owner")).toBeNull();
    expect(roleParser.parseServerSide(undefined)).toBeNull();
  });

  it("caps client search input at the server contract", () => {
    expect(normalizeUsersSearch("ana")).toBe("ana");
    expect(
      normalizeUsersSearch("a".repeat(DATA_TABLE_MAX_SEARCH_LENGTH + 1)),
    ).toHaveLength(DATA_TABLE_MAX_SEARCH_LENGTH);
  });
});
