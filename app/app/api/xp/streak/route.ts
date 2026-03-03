import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";
const API_TOKEN = process.env.BACKEND_API_TOKEN ?? "";

export async function POST(request: NextRequest) {
  if (!API_TOKEN) {
    return NextResponse.json(
      { error: "Server misconfigured: missing API token" },
      { status: 500 }
    );
  }

  let body: { wallet?: string; amount?: number };
  try {
    body = (await request.json()) as { wallet?: string; amount?: number };
  } catch {
    body = {};
  }

  const wallet = typeof body.wallet === "string" ? body.wallet.trim() : "";
  const amount = Number(body.amount);
  if (!wallet) {
    return NextResponse.json({ error: "wallet is required" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 1) {
    return NextResponse.json(
      { error: "amount must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${BACKEND_URL.replace(/\/$/, "")}/v1/academy/reward-xp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_TOKEN,
        },
        body: JSON.stringify({
          recipient: wallet,
          amount,
          memo: "streak",
        }),
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

