import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";
const API_TOKEN = process.env.BACKEND_API_TOKEN ?? "";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!API_TOKEN) {
    return NextResponse.json(
      { error: "Server misconfigured: missing API token" },
      { status: 500 }
    );
  }

  const { slug: slugParam } = await params;
  const slug = slugParam?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${BACKEND_URL.replace(/\/$/, "")}/v1/academy/challenges/by-slug/${encodeURIComponent(
        slug
      )}`,
      {
        headers: {
          "X-API-Key": API_TOKEN,
        },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error ?? res.statusText },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

