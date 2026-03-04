"use client";

import { useQuery } from "@tanstack/react-query";

interface CommunityStatsResponse {
  wallet: string;
  threadCount: number;
  replyCount: number;
  totalContributions: number;
}

async function fetchCommunityStats(walletAddress: string): Promise<CommunityStatsResponse> {
  const res = await fetch(`/api/community/stats/${walletAddress}`, {
    method: "GET",
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as
    | CommunityStatsResponse
    | { error?: string };

  if (!res.ok) {
    throw new Error("error" in data ? (data.error ?? "Failed to load community stats.") : "Failed to load community stats.");
  }
  return data as CommunityStatsResponse;
}

export function useCommunityStats(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ["communityStats", walletAddress ?? ""],
    queryFn: () => fetchCommunityStats(walletAddress ?? ""),
    enabled: !!walletAddress,
  });
}
