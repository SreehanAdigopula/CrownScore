import "server-only";
import { request as undiciRequest } from "undici";

declare global {
  // eslint-disable-next-line no-var
  var __crownscoreNeonAuthFetchPatched: boolean | undefined;
}

/**
 * Neon Auth's Next.js proxy uses global `fetch` for the app → Neon Auth hop.
 * Node's fetch implementation always attaches `Sec-Fetch-Mode: cors` on
 * cross-origin requests. Neon Auth then treats that hop as a browser CORS
 * call and rejects Origins that are not in the trusted-domain allowlist —
 * including the production app origin — even though localhost is allowed.
 *
 * Route the Neon Auth upstream hop through `undici.request` instead so we
 * forward the real browser Origin without fetch-metadata headers.
 */
export function installNeonAuthUpstreamFetchPatch() {
  if (globalThis.__crownscoreNeonAuthFetchPatched) return;

  const baseUrl = process.env.NEON_AUTH_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("NEON_AUTH_BASE_URL is required for Neon Auth.");
  }

  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (!url.startsWith(baseUrl)) {
      return originalFetch(input, init);
    }

    const method =
      init?.method ??
      (typeof input !== "string" && !(input instanceof URL) ? input.method : "GET");

    const headers = new Headers(
      init?.headers ??
        (typeof input !== "string" && !(input instanceof URL) ? input.headers : undefined),
    );
    for (const name of ["sec-fetch-mode", "sec-fetch-site", "sec-fetch-dest", "sec-fetch-user"]) {
      headers.delete(name);
    }

    let body = init?.body;
    if (
      body == null &&
      typeof input !== "string" &&
      !(input instanceof URL) &&
      input.method !== "GET" &&
      input.method !== "HEAD"
    ) {
      body = await input.text();
    }

    const payload =
      typeof body === "string" || body instanceof Uint8Array || body == null
        ? body
        : Buffer.from(await new Response(body).arrayBuffer());

    const upstream = await undiciRequest(url, {
      method,
      headers: Object.fromEntries(headers.entries()),
      body: payload ?? undefined,
    });

    const responseHeaders = new Headers();
    for (const [key, value] of Object.entries(upstream.headers)) {
      if (value == null) continue;
      if (Array.isArray(value)) {
        for (const item of value) responseHeaders.append(key, item);
      } else {
        responseHeaders.set(key, value);
      }
    }

    return new Response(Buffer.from(await upstream.body.arrayBuffer()), {
      status: upstream.statusCode,
      headers: responseHeaders,
    });
  }) as typeof fetch;

  globalThis.__crownscoreNeonAuthFetchPatched = true;
}
