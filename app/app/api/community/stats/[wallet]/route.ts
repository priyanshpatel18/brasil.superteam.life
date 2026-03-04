import { NextResponse } from "next/server";
import { getCommunityStatsByWallet } from "@/lib/community-db";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ wallet: string }> }
) {
  const params = await context.params;
  const wallet = params.wallet?.trim() ?? "";

  if (!wallet || wallet.length > 88) {
    return NextResponse.json(
      { error: "Invalid wallet address." },
      { status: 400 }
    );
  }

  try {
    const stats = await getCommunityStatsByWallet(wallet);
    return NextResponse.json({
      wallet,
      ...stats,
      totalContributions: stats.threadCount + stats.replyCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load community stats.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
