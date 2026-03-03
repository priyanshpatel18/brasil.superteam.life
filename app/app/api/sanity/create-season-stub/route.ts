import { NextRequest, NextResponse } from "next/server";
import { getSanityWriteClient, verifyAdminToken } from "../_shared";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Admin JWT required" }, { status: 401 });
  }

  let body: {
    slug?: string;
    name?: string;
    description?: string;
    startAt?: string;
    endAt?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const slug = (body.slug ?? "").trim();
  const name = (body.name ?? "").trim();
  const startAt = (body.startAt ?? "").trim();
  const endAt = (body.endAt ?? "").trim();
  if (!slug || !name || !startAt || !endAt) {
    return NextResponse.json(
      { error: "slug, name, startAt, endAt are required" },
      { status: 400 }
    );
  }

  try {
    const client = getSanityWriteClient();
    const doc = await client.create({
      _type: "season",
      slug: { _type: "slug", current: slug },
      name,
      description: body.description?.trim() || undefined,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
    } as unknown as { _type: string });

    return NextResponse.json({ _id: (doc as { _id: string })._id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create season";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

