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
  const day = searchParams.get("day") ?? undefined;
  const wallet = searchParams.get("wallet") ?? undefined;
  const all = searchParams.get("all") ?? undefined;
  const q = new URLSearchParams();
  if (day) q.set("day", day);
  if (wallet) q.set("wallet", wallet);
  if (all) q.set("all", all);
  const query = q.toString();
  try {
    const res = await fetch(
      `${BACKEND_URL.replace(/\/$/, "")}/v1/academy/challenges${query ? `?${query}` : ""}`,
      { headers: { "X-API-Key": API_TOKEN } }
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
