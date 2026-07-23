"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations";

export type LoginState = {
  status: "idle" | "sent" | "error";
  message?: string;
  email?: string;
};

export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Correo inválido",
    };
  }

  const supabase = await createClient();

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (await headers()).get("origin") ??
    "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "sent", email: parsed.data.email };
}
