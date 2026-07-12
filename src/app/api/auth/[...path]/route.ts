import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const handlers = auth.handler();
type AuthContext = { params: Promise<{ path: string[] }> };

export function GET(request: NextRequest, context: AuthContext) {
  return handlers.GET(request, context);
}

export function POST(request: NextRequest, context: AuthContext) {
  return handlers.POST(request, context);
}

export function PUT(request: NextRequest, context: AuthContext) {
  return handlers.PUT(request, context);
}

export function PATCH(request: NextRequest, context: AuthContext) {
  return handlers.PATCH(request, context);
}

export function DELETE(request: NextRequest, context: AuthContext) {
  return handlers.DELETE(request, context);
}
