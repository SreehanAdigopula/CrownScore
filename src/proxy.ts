import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/progress/:path*",
    "/check-in/:path*",
    "/history/:path*",
    "/coach/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/api/check-ins/:path*",
    "/api/preferences/:path*",
    "/api/session/:path*",
  ],
};
