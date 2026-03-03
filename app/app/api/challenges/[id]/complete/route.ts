import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";
const API_TOKEN = process.env.BACKEND_API_TOKEN ?? "";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Challenge id required" },
      { status: 400 }
    );
  }
  if (!API_TOKEN) {
    return NextResponse.json(
      { error: "Server misconfigured: missing API token" },
      { status: 500 }
    );
  }
  let body: { wallet?: string; submissionLink?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const wallet = body.wallet?.trim();
  if (!wallet) {
    return NextResponse.json(
      { error: "wallet is required" },
      { status: 400 }
    );
  }
  const submissionLink = typeof body.submissionLink === "string" ? body.submissionLink.trim() || undefined : undefined;
  try {
    const res = await fetch(
      `${BACKEND_URL.replace(/\/$/, "")}/v1/academy/challenges/${id}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_TOKEN,
        },
        body: JSON.stringify({ wallet, ...(submissionLink !== undefined && { submissionLink }) }),
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
