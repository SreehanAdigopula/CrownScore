import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, fetchApiJson } from "./api-client";

describe("fetchApiJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns data from a successful ApiResponse", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ success: true, data: { uid: "u1" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    await expect(fetchApiJson<{ uid: string }>("/api/session")).resolves.toEqual({ uid: "u1" });
  });

  it("maps HTML DOCTYPE bodies to a clear ApiClientError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response("<!DOCTYPE html><html><body>Sign in</body></html>", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }),
      ),
    );
    await expect(fetchApiJson("/api/preferences")).rejects.toMatchObject({
      name: "ApiClientError",
      code: "NON_JSON_RESPONSE",
    });
  });

  it("treats auth redirects as UNAUTHORIZED instead of parsing HTML", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(null, {
          status: 307,
          headers: { Location: "/auth/sign-in" },
        }),
      ),
    );
    await expect(fetchApiJson("/api/check-ins/analyze", { method: "POST" })).rejects.toBeInstanceOf(ApiClientError);
    await expect(fetchApiJson("/api/check-ins/analyze", { method: "POST" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("surfaces structured API error messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in to save preferences." } }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    await expect(fetchApiJson("/api/preferences")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "Sign in to save preferences.",
      status: 401,
    });
  });
});
