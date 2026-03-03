import { NextRequest, NextResponse } from "next/server";
import { getSanityWriteClient, verifyAdminToken } from "../_shared";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Admin JWT required" }, { status: 401 });
  }

  let body: { id?: string; title?: string; slug?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const id = (body.id ?? "").trim();
  const title = (body.title ?? "").trim();
  const slug = (body.slug ?? "").trim();
  if (!id || !title || !slug) {
    return NextResponse.json(
      { error: "id, title, slug are required" },
      { status: 400 }
    );
  }

  try {
    const client = getSanityWriteClient();
    const doc = await client.create({
      _type: "course",
      id,
      title,
      slug: { _type: "slug", current: slug },
      description: "",
      difficulty: "beginner",
      lessonCount: 1,
      xpPerLesson: 0,
      duration: "",
      tags: [],
      modules: [],
      published: false,
    } as unknown as { _type: string });

    return NextResponse.json({ _id: (doc as { _id: string })._id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create course";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

