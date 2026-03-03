import { useQuery } from "@tanstack/react-query";

export interface SeasonItem {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  startAt: string;
  endAt: string;
  challengeCount: number;
  fromSanity?: boolean;
  sanityId?: string;
  status: "active" | "upcoming" | "past";
}

interface SeasonsResponse {
  seasons: SeasonItem[];
  error?: string;
}

async function fetchSeasons(): Promise<SeasonItem[]> {
  const res = await fetch("/api/seasons");
  const data = (await res.json()) as SeasonsResponse & { error?: string };
  if (!res.ok || data.error) {
    throw new Error(data.error ?? "Failed to load seasons");
  }
  return data.seasons ?? [];
}

export function useSeasons() {
  return useQuery({
    queryKey: ["seasons"],
    queryFn: fetchSeasons,
  });
}
