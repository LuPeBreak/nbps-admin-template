import { describe, expect, it } from "vitest";
import { roleParser } from "./users-search-params";

describe("users search params", () => {
  it("accepts only supported user roles", () => {
    expect(roleParser.parseServerSide("admin")).toBe("admin");
    expect(roleParser.parseServerSide("user")).toBe("user");
    expect(roleParser.parseServerSide("owner")).toBeNull();
    expect(roleParser.parseServerSide(undefined)).toBeNull();
  });
});
