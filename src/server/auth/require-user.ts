import "server-only";
import { auth } from "@/lib/auth/server";

export class UnauthorizedError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "UnauthorizedError";
  }
}

export async function requireUser() {
  const { data: session, error } = await auth.getSession();
  if (error || !session?.user?.id || !session.user.email) throw new UnauthorizedError();
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name || null,
  };
}
