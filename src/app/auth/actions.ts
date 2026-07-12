"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export type AuthActionState = { error: string } | null;

export async function signUpWithEmail(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password || name.length < 2) {
    return { error: "Name, email, and password are required." };
  }

  const { error } = await auth.signUp.email({ email, password, name });
  if (error) {
    return { error: error.message || "Failed to create account." };
  }

  redirect("/onboarding");
}

export async function signInWithEmail(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await auth.signIn.email({ email, password });
  if (error) {
    return { error: error.message || "Failed to sign in. Try again." };
  }

  redirect("/dashboard");
}
