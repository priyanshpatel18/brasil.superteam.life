import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";
const API_TOKEN = process.env.BACKEND_API_TOKEN ?? "";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET ?? "";

const JWT_ISSUER = "academy-admin";
const JWT_AUDIENCE = "academy-admin";

async function verifyAdminToken(token: string): Promise<boolean> {
  if (!ADMIN_JWT_SECRET || ADMIN_JWT_SECRET.length < 32) return false;
  try {
    const key = new TextEncoder().encode(ADMIN_JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, key, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload.sub === "admin";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json(
      { error: "Admin JWT required" },
      { status: 401 }
    );
  }

  if (!API_TOKEN) {
    return NextResponse.json(
      { error: "Server misconfigured: missing API token" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const challengeId = searchParams.get("challengeId") ?? undefined;
  const q = new URLSearchParams();
  if (challengeId) q.set("challengeId", challengeId);
  const query = q.toString();

  try {
    const res = await fetch(
      `${BACKEND_URL.replace(
        /\/$/,
        ""
      )}/v1/academy/challenges/completions${query ? `?${query}` : ""}`,
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

