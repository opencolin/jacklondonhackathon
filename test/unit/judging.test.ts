import { describe, expect, it, vi } from "vitest";

// Stub `server-only` so `import "server-only"` in the SUT doesn't blow up
// in the Node test runner.
vi.mock("server-only", () => ({}));

// Stub the integrations the SUT imports — we only test pure math here.
vi.mock("@/server/integrations/github", () => ({
  snapshotRepo: vi.fn(),
}));
vi.mock("@/server/integrations/nebius", () => ({
  nebiusJudge: vi.fn(),
}));

// Stub the db module to a placeholder so importing judging.ts doesn't try to
// connect to Postgres.
vi.mock("@/server/db", () => ({
  db: {},
  client: {},
}));

// Stub env so the schema doesn't blow up missing DATABASE_URL etc.
vi.mock("@/server/env", () => ({
  env: { NODE_ENV: "test" },
}));

import { computeComposite, recomputeRanks } from "@/server/services/judging";

describe("computeComposite", () => {
  it("returns null when every component is missing", () => {
    expect(
      computeComposite({ ai: null, sponsorAvg: null, investorAvg: null }),
    ).toBeNull();
  });

  it("matches the canonical formula when all three components are present", () => {
    // 0.4*ai + 0.4*sponsor + 0.2*investor
    const ai = 80;
    const sponsorAvg = 60;
    const investorAvg = 40;
    const got = computeComposite({ ai, sponsorAvg, investorAvg });
    const want = 0.4 * ai + 0.4 * sponsorAvg + 0.2 * investorAvg;
    expect(got).toBeCloseTo(want, 2);
  });

  it("redistributes weight when investor scores are missing", () => {
    // ai=80, sponsor=60, investor=null
    // remaining weights: 0.4 + 0.4 = 0.8 -> rescale by 1/0.8 = 1.25
    // expected = 80*0.5 + 60*0.5 = 70
    const got = computeComposite({ ai: 80, sponsorAvg: 60, investorAvg: null });
    expect(got).toBeCloseTo(70, 2);
  });

  it("redistributes weight when sponsor scores are missing", () => {
    // ai=80, sponsor=null, investor=40
    // remaining weights: 0.4 + 0.2 = 0.6
    // expected = 80*(0.4/0.6) + 40*(0.2/0.6) = 53.333 + 13.333 = 66.67
    const got = computeComposite({ ai: 80, sponsorAvg: null, investorAvg: 40 });
    expect(got).toBeCloseTo(66.67, 1);
  });

  it("falls back to the AI score when sponsor + investor are both missing", () => {
    expect(
      computeComposite({ ai: 75, sponsorAvg: null, investorAvg: null }),
    ).toBeCloseTo(75, 2);
  });

  it("rounds to two decimal places", () => {
    const got = computeComposite({ ai: 1, sponsorAvg: 2, investorAvg: 3 });
    // 0.4 + 0.8 + 0.6 = 1.8
    expect(got).toBeCloseTo(1.8, 2);
    // and the actual numeric value should not have floating-point fuzz beyond 2dp
    expect(Math.abs((got ?? 0) * 100 - Math.round((got ?? 0) * 100))).toBeLessThan(
      1e-9,
    );
  });

  it("clamps to 0..100 by virtue of inputs being expected in that range (smoke test)", () => {
    const got = computeComposite({ ai: 100, sponsorAvg: 100, investorAvg: 100 });
    expect(got).toBeCloseTo(100, 2);
    const zero = computeComposite({ ai: 0, sponsorAvg: 0, investorAvg: 0 });
    expect(zero).toBe(0);
  });
});

describe("recomputeRanks", () => {
  it("issues a single UPDATE that ranks projects in the event", async () => {
    let received: unknown;
    const tx = {
      execute: vi.fn(async (query: unknown) => {
        received = query;
        return [];
      }),
    };

    await recomputeRanks("event-123", tx);

    expect(tx.execute).toHaveBeenCalledTimes(1);
    expect(received).toBeTruthy();

    // Drizzle's `sql` builder exposes raw chunks (.queryChunks in v0.36) plus
    // a stringified form via Symbol.toPrimitive / .toQuery. We just walk the
    // object and look for the pieces of SQL we expect, plus the eventId
    // appearing as a bound parameter value.
    const dump = walk(received).join(" ");
    expect(dump).toMatch(/ROW_NUMBER/i);
    expect(dump).toMatch(/composite_score/i);
    expect(dump).toMatch(/UPDATE projects/i);
    expect(dump).toContain("event-123");
  });
});

// Recursively flatten an object into a list of strings so we can do simple
// substring checks across nested template chunks.
function walk(value: unknown, seen = new WeakSet<object>()): string[] {
  if (value == null) return [];
  if (typeof value === "string") return [value];
  if (typeof value === "number" || typeof value === "boolean") return [String(value)];
  if (typeof value !== "object") return [];
  if (seen.has(value as object)) return [];
  seen.add(value as object);
  const out: string[] = [];
  for (const key of Object.keys(value as Record<string, unknown>)) {
    out.push(...walk((value as Record<string, unknown>)[key], seen));
  }
  return out;
}
