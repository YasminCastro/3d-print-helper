import { cookies } from "next/headers";

import { backendUrl } from "@/lib/backend-url";

export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("Authorization")?.value;

  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(backendUrl(path), { ...init, headers });
}

export async function backendErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    const message = body?.error?.message;
    return typeof message === "string" && message.length > 0 ? message : fallback;
  } catch {
    return fallback;
  }
}
