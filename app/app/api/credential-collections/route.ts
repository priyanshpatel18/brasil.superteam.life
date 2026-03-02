import { NextResponse } from "next/server";
import { getCredentialCollectionsFromDb } from "@/lib/services/indexing-db";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";
const API_TOKEN = process.env.BACKEND_API_TOKEN ?? "";

interface CredentialCollectionListItem {
  trackId: number;
  collectionAddress: string;
  name: string | null;
  imageUrl: string | null;
  metadataUri: string | null;
}

function normalizeCollectionAddress(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function mergeCollectionLists(
  indexedList: CredentialCollectionListItem[],
  backendList: CredentialCollectionListItem[]
): CredentialCollectionListItem[] {
  const byTrack = new Map<number, CredentialCollectionListItem>();

  for (const row of indexedList) {
    const collectionAddress = normalizeCollectionAddress(row.collectionAddress);
    if (!collectionAddress) continue;
    byTrack.set(row.trackId, { ...row, collectionAddress });
  }

  // Backend is considered fresher; overwrite indexed rows per track when present.
  for (const row of backendList) {
    const collectionAddress = normalizeCollectionAddress(row.collectionAddress);
    if (!collectionAddress) continue;
    byTrack.set(row.trackId, { ...row, collectionAddress });
  }

  return [...byTrack.values()].sort((a, b) => a.trackId - b.trackId);
}

export async function GET() {
  const indexed = await getCredentialCollectionsFromDb();
  const indexedList: CredentialCollectionListItem[] = indexed?.list ?? [];

  let backendList: CredentialCollectionListItem[] = [];
  let backendError: string | undefined;

  if (API_TOKEN) {
    try {
      const res = await fetch(
        `${BACKEND_URL.replace(/\/$/, "")}/v1/academy/credential-collections`,
        {
          method: "GET",
          headers: { "X-API-Key": API_TOKEN },
          cache: "no-store",
        }
      );
      const data = (await res.json().catch(() => ({}))) as {
        list?: CredentialCollectionListItem[];
        error?: string;
      };
      if (res.ok) {
        backendList = data.list ?? [];
      } else {
        backendError = data.error ?? res.statusText;
      }
    } catch (err) {
      backendError = err instanceof Error ? err.message : "Request failed";
    }
  } else if (indexedList.length === 0) {
    backendError = "Server misconfigured: missing API token";
  }

  const mergedList = mergeCollectionLists(indexedList, backendList);
  if (mergedList.length === 0) {
    return NextResponse.json(
      { collections: {}, list: [], error: backendError ?? "No credential collections configured" },
      { status: 200 }
    );
  }

  const collections: Record<string, string> = {};
  for (const row of mergedList) {
    collections[String(row.trackId)] = row.collectionAddress;
  }

  return NextResponse.json({
    collections,
    list: mergedList,
    error: backendError,
  });
}
