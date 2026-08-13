"use server";

import { cookies } from "next/headers";

import {
  loginFormSchema,
  signupFormSchema,
  type LoginFormInput,
  type SignupFormInput,
} from "@/lib/schemas/auth";
import { backendUrl } from "@/lib/backend-url";
import { backendFetch } from "@/lib/backend-fetch";

type SignupResult =
  | { success: true }
  | { success: false; error: string };

type LoginResult =
  | { success: true }
  | { success: false; error: string };

export async function signupAction(values: SignupFormInput): Promise<SignupResult> {
  const parsed = signupFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { name, email, password } = parsed.data;

  let response: Response;
  try {
    response = await fetch(backendUrl("/auth/signup"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
  } catch {
    return { success: false, error: "Não foi possível conectar ao servidor" };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const error =
      body?.error?.message ?? body?.message ?? "Não foi possível criar a conta";
    return { success: false, error };
  }

  return { success: true };
}

export async function loginAction(values: LoginFormInput): Promise<LoginResult> {
  const parsed = loginFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { email, password } = parsed.data;

  let response: Response;
  try {
    response = await fetch(backendUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { success: false, error: "Não foi possível conectar ao servidor" };
  }

  if (!response.ok) {
    if (response.status === 401) {
      return { success: false, error: "E-mail ou senha incorretos" };
    }
    const body = await response.json().catch(() => null);
    const error = body?.error?.message ?? body?.message ?? "Não foi possível entrar";
    return { success: false, error };
  }

  const setCookieHeader = response.headers.get("set-cookie");
  const token = setCookieHeader ? extractCookieValue(setCookieHeader, "Authorization") : null;

  if (token) {
    const cookieStore = await cookies();
    cookieStore.set("Authorization", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return { success: true };
}

function extractCookieValue(setCookieHeader: string, name: string): string | null {
  const match = setCookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return match ? match.slice(name.length + 1) : null;
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("Authorization")?.value;

  if (token) {
    try {
      await fetch(backendUrl("/auth/logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignora falha ao avisar o backend; o cookie local é removido de qualquer forma
    }
  }

  cookieStore.delete("Authorization");
}

type CurrentUser = { name: string; email: string };

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("Authorization")?.value;
  if (!token) return null;

  const userId = decodeTokenUserId(token);
  if (!userId) return null;

  let response: Response;
  try {
    response = await backendFetch(`/users/${userId}`);
  } catch {
    return null;
  }
  if (!response.ok) return null;

  const body = await response.json().catch(() => null);
  const { email, name } = body?.data ?? {};
  if (!email || !name) return null;

  return { email, name };
}

function decodeTokenUserId(token: string): string | null {
  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf-8"));
    return payload?.id ? String(payload.id) : null;
  } catch {
    return null;
  }
}
