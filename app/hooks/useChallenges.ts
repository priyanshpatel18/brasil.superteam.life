import { useQuery } from "@tanstack/react-query";

export interface ChallengeItem {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  config?: Record<string, unknown>;
  xpReward: number;
  seasonId: number | null;
  completed?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  seasonName?: string | null;
  fromSanity?: boolean;
  sanityId?: string;
}

interface ChallengesResponse {
  day: string;
  challenges: ChallengeItem[];
  error?: string;
}

async function fetchChallenges(day?: string, wallet?: string): Promise<ChallengesResponse> {
  const params = new URLSearchParams();
  if (day) params.set("day", day);
  if (wallet) params.set("wallet", wallet);
  const q = params.toString();
  const res = await fetch(`/api/challenges${q ? `?${q}` : ""}`);
  const data = (await res.json()) as ChallengesResponse & { error?: string };
  if (!res.ok || data.error) {
    throw new Error(data.error ?? "Failed to load challenges");
  }
  return data;
}

export function useChallenges(wallet: string | undefined) {
  return useQuery({
    queryKey: ["challenges", wallet ?? "anon"],
    queryFn: () => fetchChallenges(undefined, wallet ?? undefined),
  });
}

export function useAllChallenges() {
  return useQuery({
    queryKey: ["challenges", "all"],
    queryFn: async () => {
      const params = new URLSearchParams({ all: "true" });
      const res = await fetch(`/api/challenges?${params}`);
      const data = (await res.json()) as ChallengesResponse & { error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Failed to load challenges");
      }
      return data as { challenges: ChallengeItem[] };
    },
  });
}
