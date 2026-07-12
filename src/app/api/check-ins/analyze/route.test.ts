import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

describe("POST /api/check-ins/analyze", () => {
  it("returns success with a valid analysis payload", async () => {
    const request = new Request("http://localhost/api/check-ins/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawDensityRatio: 0.48,
        baselineRatio: 0.4,
        treatmentWeek: 0,
        treatment: "MINOXIDIL",
        coachStyle: "SUPPORTIVE",
        historyCount: 0,
        consecutiveDeclines: 0,
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.analysis.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(json.data.analysis.normalizedScore).toBe(120);
    expect(json.data.analysis.algorithmVersion).toBe("crownscore-relative-v1");
  });

  it("returns 400 for invalid input", async () => {
    const request = new Request("http://localhost/api/check-ins/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawDensityRatio: -1 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_ANALYSIS_INPUT");
  });

  it("returns 400 for malformed JSON", async () => {
    const request = new Request("http://localhost/api/check-ins/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_JSON");
  });

  it("returns 500 for unexpected server-side analysis failures", async () => {
    vi.resetModules();
    vi.doMock("@/server/services/analysis-service", () => ({
      analyzeCheckIn: vi.fn().mockRejectedValue(new Error("Internal failure")),
    }));
    const { POST: mockedPost } = await import("./route");
    const request = new Request("http://localhost/api/check-ins/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawDensityRatio: 0.48, baselineRatio: 0.4 }),
    });
    const response = await mockedPost(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("ANALYSIS_FAILED");
    vi.doUnmock("@/server/services/analysis-service");
    vi.resetModules();
  });
});
