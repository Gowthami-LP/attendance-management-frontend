import type { AxiosHeaders } from "axios";
import { afterEach, describe, expect, it } from "vitest";
import apiClient from "./client";
import { setAccessToken, setActiveTenantId } from "./token";

describe("apiClient tenant context", () => {
  afterEach(() => {
    setAccessToken(null);
    setActiveTenantId(null);
  });

  it("sends the bearer token and selected tenant on API requests", async () => {
    setAccessToken("test-token");
    setActiveTenantId("tenant-acme");
    let requestHeaders: AxiosHeaders | undefined;

    await apiClient.get("/employees", {
      adapter: async (config) => {
        requestHeaders = config.headers;
        return {
          data: [],
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      },
    });

    expect(requestHeaders?.get("Authorization")).toBe("Bearer test-token");
    expect(requestHeaders?.get("X-Tenant-ID")).toBe("tenant-acme");
  });
});
