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
