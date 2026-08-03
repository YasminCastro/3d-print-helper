import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend-fetch";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const response = await backendFetch(`/journal-entries/photos/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return new NextResponse(null, { status: response.status });
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
