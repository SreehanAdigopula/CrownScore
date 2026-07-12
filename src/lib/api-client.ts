import type { ApiResponse } from "@/server/domain/types";

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

function looksLikeHtml(text: string) {
  const trimmed = text.trimStart().slice(0, 32).toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html");
}

/**
 * Fetch a CrownScore API route and parse a typed ApiResponse.
 * Never throws raw JSON.parse / "Unexpected token '<'" errors — HTML
 * error pages, auth redirects, and malformed bodies become ApiClientError.
 */
export async function fetchApiJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const response = await fetch(input, {
    ...init,
    headers,
    // Stay on the original response so middleware 307→HTML never becomes
    // a successful DOCTYPE body that response.json() cannot parse.
    redirect: init?.redirect ?? "manual",
  });

  if (response.type === "opaqueredirect" || (response.status >= 300 && response.status < 400)) {
    throw new ApiClientError("Sign in again to continue.", "UNAUTHORIZED", response.status || 401);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (!text) {
    if (!response.ok) {
      throw new ApiClientError(
        response.status === 401 || response.status === 403
          ? "Sign in again to continue."
          : `Request failed (${response.status}).`,
        response.status === 401 || response.status === 403 ? "UNAUTHORIZED" : "EMPTY_RESPONSE",
        response.status,
      );
    }
    throw new ApiClientError("The server returned an empty response.", "EMPTY_RESPONSE", response.status);
  }

  if (!contentType.includes("application/json") || looksLikeHtml(text)) {
    throw new ApiClientError(
      response.status === 401 || response.status === 403
        ? "Sign in again to continue."
        : "The server returned a non-JSON response. Please retry.",
      "NON_JSON_RESPONSE",
      response.status || 502,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new ApiClientError("The server returned invalid JSON. Please retry.", "INVALID_JSON", response.status || 502);
  }

  const result = parsed as ApiResponse<T> & { redirect?: string; error?: string | { code?: string; message?: string } };

  // Neon Auth middleware sometimes emits { redirect, status } JSON instead of ApiResponse.
  if (result && typeof result === "object" && "redirect" in result && typeof result.redirect === "string") {
    throw new ApiClientError("Sign in again to continue.", "UNAUTHORIZED", 401);
  }

  if (!response.ok || !result || typeof result !== "object" || !("success" in result) || result.success !== true) {
    const error =
      result && typeof result === "object" && "error" in result
        ? typeof result.error === "string"
          ? { code: "REQUEST_FAILED", message: result.error }
          : result.error
        : undefined;
    throw new ApiClientError(
      error?.message ?? (response.status === 401 ? "Sign in again to continue." : "Request failed."),
      error?.code ?? (response.status === 401 ? "UNAUTHORIZED" : "REQUEST_FAILED"),
      response.status,
    );
  }

  return result.data;
}
