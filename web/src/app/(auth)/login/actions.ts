"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export interface LoginState {
  error?: boolean;
}

/**
 * Server action wrapping Auth.js signIn. On success signIn throws a redirect
 * (propagated). On bad credentials it throws AuthError → we surface an error flag.
 */
export async function loginAction(
  _prev: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) return { error: true };
    throw error; // redirect (and anything else) must propagate
  }
}
