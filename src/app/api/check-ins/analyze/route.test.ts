import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ authenticated: true, saveCheckIn: vi.fn() }));

vi.mock("@/server/auth/require-user", () => {
  class UnauthorizedError extends Error {}
  return {
    UnauthorizedError,
    requireUser: vi.fn(async () => {
      if (!state.authenticated) throw new UnauthorizedError();
      return { id: "test-user", email: "test@example.com", name: "Test User" };
    }),
  };
});

vi.mock("@/server/repositories/neon-user-repository", () => ({
  NeonUserRepository: class {
    saveCheckIn = state.saveCheckIn;
  },
}));

import { POST } from "./route";

const quality = { brightness: 0.55, sharpness: 0.5, contrast: 0.4, rotation: 0, subjectCoverage: 0.5, warnings: [], status: "GOOD" };

describe("POST /api/check-ins/analyze", () => {
  beforeEach(() => {
    state.authenticated = true;
    state.saveCheckIn.mockReset();
  });

  it("returns the new visible-health response schema end to end", async () => {
    const request = new Request("http://localhost/api/check-ins/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ detections: [{ className: "dandruff", confidence: 0.8, box: { x: 0.1, y: 0.1, width: 0.4, height: 0.4 } }], quality }),
    });
    const response = await POST(request);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.analysis).toMatchObject({ status: "SCORED", algorithmVersion: "crownscore-visible-health-v1", modelVersion: "hair-health-yolov8n-v1" });
    expect(json.data.analysis.healthScore).toBeLessThan(100);
    expect(json.data.analysis).not.toHaveProperty("rawDensityRatio");
    expect(state.saveCheckIn).toHaveBeenCalledOnce();
  });

  it("returns 400 for the old payload", async () => {
    const response = await POST(new Request("http://localhost/api/check-ins/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rawDensityRatio: 0.48 }) }));
    expect(response.status).toBe(400);
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(new Request("http://localhost/api/check-ins/analyze", { method: "POST", body: "not-json" }));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("INVALID_JSON");
  });

  it("returns 400 for out-of-bounds detection boxes", async () => {
    const response = await POST(
      new Request("http://localhost/api/check-ins/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detections: [{ className: "dandruff", confidence: 0.8, box: { x: 0.9, y: 0.1, width: 0.2, height: 0.2 } }], quality }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 401 when the Neon Auth session is missing", async () => {
    state.authenticated = false;
    const response = await POST(
      new Request("http://localhost/api/check-ins/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detections: [], quality }),
      }),
    );
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("UNAUTHORIZED");
  });
});
