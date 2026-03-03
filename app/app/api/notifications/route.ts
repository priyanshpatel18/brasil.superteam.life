import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";
const API_TOKEN = process.env.BACKEND_API_TOKEN ?? "";

export async function GET(request: NextRequest) {
  if (!API_TOKEN) {
    return NextResponse.json(
      { error: "Server misconfigured: missing API token" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet") ?? undefined;
  const role = searchParams.get("role") ?? "learner";

  const q = new URLSearchParams();
  if (wallet) q.set("wallet", wallet);
  if (role) q.set("role", role);
  const query = q.toString();

  try {
    const res = await fetch(
      `${BACKEND_URL.replace(
        /\/$/,
        ""
      )}/v1/academy/notifications${query ? `?${query}` : ""}`,
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

export async function POST(request: NextRequest) {
  if (!API_TOKEN) {
    return NextResponse.json(
      { error: "Server misconfigured: missing API token" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") ?? "";

  if (action !== "mark-read") {
    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  }

  let body: { ids?: number[] };
  try {
    body = (await request.json()) as { ids?: number[] };
  } catch {
    body = {};
  }

  try {
    const res = await fetch(
      `${BACKEND_URL.replace(
        /\/$/,
        ""
      )}/v1/academy/notifications/mark-read`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_TOKEN,
        },
        body: JSON.stringify(body),
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

