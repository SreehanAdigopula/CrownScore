import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

// Protect page navigations only. API routes must NOT be matched here —
// Neon Auth middleware redirects unauthenticated requests to the HTML
// sign-in page (307 → <!DOCTYPE…>), and client fetch().json() then fails.
// APIs already return structured JSON 401s via requireUser().
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/progress",
    "/progress/:path*",
    "/check-in",
    "/check-in/:path*",
    "/history",
    "/history/:path*",
    "/coach",
    "/coach/:path*",
    "/settings",
    "/settings/:path*",
    "/onboarding",
    "/onboarding/:path*",
  ],
};
