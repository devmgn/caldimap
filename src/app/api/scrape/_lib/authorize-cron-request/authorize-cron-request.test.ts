// @vitest-environment node
import { describe, expect, it } from "vitest";
import { authorizeCronRequest } from "./authorize-cron-request";

const SECRET = "test-secret";

describe("authorizeCronRequest", () => {
  it("authorizes the matching bearer secret in production", () => {
    expect(
      authorizeCronRequest({
        authHeader: `Bearer ${SECRET}`,
        cronSecret: SECRET,
        vercelEnv: "production",
      })
    ).toBe("authorized");
  });

  it.each([["preview"], ["development"], [undefined]])(
    "forbids VERCEL_ENV=%s even with the matching secret",
    (vercelEnv) => {
      expect(
        authorizeCronRequest({
          authHeader: `Bearer ${SECRET}`,
          cronSecret: SECRET,
          vercelEnv,
        })
      ).toBe("forbidden");
    }
  );

  it.each([
    ["a wrong secret", "Bearer wrong", SECRET],
    ["a missing header", null, SECRET],
    ["a header without the Bearer scheme", SECRET, SECRET],
    ["an unset secret", "Bearer undefined", undefined],
    ["an empty secret", "Bearer ", ""],
  ])("rejects %s", (_, authHeader, cronSecret) => {
    expect(
      authorizeCronRequest({ authHeader, cronSecret, vercelEnv: "production" })
    ).toBe("unauthorized");
  });
});
