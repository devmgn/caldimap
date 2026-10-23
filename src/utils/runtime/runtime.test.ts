import { beforeEach, describe, expect, it, vi } from "vitest";

describe("runtime", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("isProduction", () => {
    it('is true when NODE_ENV is "production"', async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { isProduction } = await import("./runtime");
      expect(isProduction).toBeTruthy();
    });

    it('is false when NODE_ENV is not "production"', async () => {
      vi.stubEnv("NODE_ENV", "development");
      const { isProduction } = await import("./runtime");
      expect(isProduction).toBeFalsy();
    });

    it("is false when NODE_ENV is undefined", async () => {
      vi.stubEnv("NODE_ENV", "");
      const { isProduction } = await import("./runtime");
      expect(isProduction).toBeFalsy();
    });
  });
});
