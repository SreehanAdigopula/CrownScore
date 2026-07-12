// Auth pages must never be statically CDN-cached: server-action POSTs
// against a cached HTML page return 405 Method Not Allowed.
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
