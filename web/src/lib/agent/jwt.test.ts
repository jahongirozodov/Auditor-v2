// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.AGENT_JWT_SECRET = "test-secret-test-secret-test-secret-0123";
  process.env.AGENT_JWT_TTL_HOURS = "12";
});

import { signAgentJwt, verifyAgentJwt } from "./jwt";

describe("agent jwt", () => {
  it("round-trips claims (sub + audit scope)", async () => {
    const token = await signAgentJwt({ sub: "u6", auditId: "AUD-1", tokenId: "tk_x" });
    const claims = await verifyAgentJwt(token);
    expect(claims).toMatchObject({ sub: "u6", auditId: "AUD-1", tokenId: "tk_x" });
  });

  it("mints a login-only token with no audit scope", async () => {
    const claims = await verifyAgentJwt(await signAgentJwt({ sub: "u6" }));
    expect(claims?.sub).toBe("u6");
    expect(claims?.auditId).toBeUndefined();
    expect(claims?.tokenId).toBeUndefined();
  });

  it("rejects a tampered token", async () => {
    const token = await signAgentJwt({ sub: "u6", auditId: "AUD-1", tokenId: "tk_x" });
    const bad = token.slice(0, -2) + (token.endsWith("a") ? "bb" : "aa");
    expect(await verifyAgentJwt(bad)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signAgentJwt({ sub: "u6", auditId: "AUD-1", tokenId: "tk_x" });
    process.env.AGENT_JWT_SECRET = "a-totally-different-secret-value-9876543";
    expect(await verifyAgentJwt(token)).toBeNull();
    process.env.AGENT_JWT_SECRET = "test-secret-test-secret-test-secret-0123";
  });

  it("rejects garbage", async () => {
    expect(await verifyAgentJwt("not.a.jwt")).toBeNull();
  });
});
