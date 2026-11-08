import { describe, expect, it } from "vitest";
import { encouragementInput, paperInput, prioritySchema, sortByPriority } from "@/lib/community";

describe("priority stars", () => {
  it("accepts 1 to 5 stars", () => {
    for (const n of [1, 2, 3, 4, 5]) expect(prioritySchema.safeParse(n).success).toBe(true);
  });

  it("rejects 0 and 6 stars", () => {
    expect(prioritySchema.safeParse(0).success).toBe(false);
    expect(prioritySchema.safeParse(6).success).toBe(false);
  });

  it("rejects an encouragement with 6 stars", () => {
    expect(encouragementInput.safeParse({ content: "加油", priority: 6 }).success).toBe(false);
  });
});

describe("sortByPriority", () => {
  it("shows more stars first, newest first on ties", () => {
    const items = [
      { id: "a", priority: 3, created_at: "2026-01-01T00:00:00Z" },
      { id: "b", priority: 5, created_at: "2026-01-01T00:00:00Z" },
      { id: "c", priority: 3, created_at: "2026-02-01T00:00:00Z" },
    ];
    expect(sortByPriority(items).map((i) => i.id)).toEqual(["b", "c", "a"]);
  });
});

describe("paper link", () => {
  it("only accepts http(s) links", () => {
    expect(paperInput.safeParse({ title: "t", priority: 3, url: "javascript:alert(1)" }).success).toBe(false);
    expect(paperInput.safeParse({ title: "t", priority: 3, url: "https://doi.org/x" }).success).toBe(true);
  });
});
