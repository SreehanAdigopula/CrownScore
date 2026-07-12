import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

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
    "/api/check-ins",
    "/api/check-ins/:path*",
    "/api/preferences",
    "/api/preferences/:path*",
    "/api/session",
    "/api/session/:path*",
  ],
};
