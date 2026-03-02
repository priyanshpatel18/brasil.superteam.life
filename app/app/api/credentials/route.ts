import { NextRequest, NextResponse } from "next/server";
import type { CredentialInfo } from "@/lib/services/learning-progress";
import { getCredentialCollectionsFromDb } from "@/lib/services/indexing-db";
import { getHeliusRpcConfig } from "@/lib/server/helius";

const TRACK_COLLECTIONS_ENV = (process.env.NEXT_PUBLIC_CREDENTIAL_TRACK_COLLECTIONS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";
const API_TOKEN = process.env.BACKEND_API_TOKEN ?? "";

/** DAS asset shape (minimal) */
interface DasAsset {
  id: string;
  uri?: string;
  grouping?: Array<{ group_key: string; group_value: string }>;
  content?: {
    metadata?: {
      name?: string;
      uri?: string;
      attributes?: Array<{ key?: string; trait_type?: string; value?: string | number }> | Record<string, string | number>;
    };
    json_uri?: string;
    links?: { image?: string };
  };
}

function getMetadataUri(asset: DasAsset): string | undefined {
  return (
    asset.content?.metadata?.uri ??
    asset.content?.json_uri ??
    asset.uri
  );
}

interface GetAssetsByOwnerResponse {
  result?: { items?: DasAsset[] };
  error?: { message?: string };
}

function normalizeCollectionAddress(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function mergeCollectionAddresses(...inputs: Array<Array<string>>): string[] {
  const set = new Set<string>();
  for (const arr of inputs) {
    for (const raw of arr) {
      const normalized = normalizeCollectionAddress(raw);
      if (normalized) set.add(normalized);
    }
  }
  return [...set];
}

function parseAttributes(
  attrs:
    | Array<{ key?: string; trait_type?: string; value?: string | number }>
    | Record<string, string | number>
    | undefined
): Record<string, string> {
  if (!attrs) return {};
  if (Array.isArray(attrs)) {
    const out: Record<string, string> = {};
    for (const item of attrs) {
      const key = item.key ?? item.trait_type;
      if (!key) continue;
      out[key] = item.value != null ? String(item.value) : "";
    }
    return out;
  }
  return Object.fromEntries(
    Object.entries(attrs).map(([k, v]) => [k, v != null ? String(v) : ""])
  );
}

function assetToCredentialInfo(asset: DasAsset): CredentialInfo {
  const attrs = parseAttributes(asset.content?.metadata?.attributes);
  const uri = getMetadataUri(asset);
  const imageUrl = asset.content?.links?.image ?? null;
  const name = asset.content?.metadata?.name ?? null;
  return {
    asset: asset.id,
    trackId: parseInt(attrs.track_id ?? "0", 10),
    level: parseInt(attrs.level ?? "0", 10),
    coursesCompleted: parseInt(attrs.courses_completed ?? "0", 10),
    totalXp: parseInt(attrs.total_xp ?? "0", 10),
    imageUrl: imageUrl ?? undefined,
    name: name ?? undefined,
    metadataUri: uri ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet")?.trim();
  if (!wallet) {
    return NextResponse.json({ credentials: [], error: "wallet required" }, { status: 400 });
  }

  const helius = getHeliusRpcConfig();
  const url = helius.url;
  if (!url) {
    return NextResponse.json({ credentials: [], error: "Helius RPC not configured" }, { status: 200 });
  }

  const indexedCollectionsPromise = (async (): Promise<string[]> => {
    const indexed = await getCredentialCollectionsFromDb();
    if (!indexed?.list?.length) return [];
    return indexed.list.map((r) => r.collectionAddress);
  })();

  const backendCollectionsPromise = (async (): Promise<string[]> => {
    if (!API_TOKEN) return [];
    try {
      const res = await fetch(
        `${BACKEND_URL.replace(/\/$/, "")}/v1/academy/credential-collections`,
        { headers: { "X-API-Key": API_TOKEN }, cache: "no-store" }
      );
      const data = (await res.json().catch(() => ({}))) as {
        list?: Array<{ collectionAddress: string }>;
      };
      if (!res.ok || !data.list?.length) return [];
      return data.list.map((r) => r.collectionAddress);
    } catch {
      return [];
    }
  })();

  const [indexedCollections, backendCollections] = await Promise.all([
    indexedCollectionsPromise,
    backendCollectionsPromise,
  ]);

  const collections = mergeCollectionAddresses(
    TRACK_COLLECTIONS_ENV,
    indexedCollections,
    backendCollections
  );

  if (collections.length === 0) {
    return NextResponse.json({ credentials: [], error: "No credential collections configured" }, { status: 200 });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getAssetsByOwner",
        params: { ownerAddress: wallet, page: 1, limit: 100 },
      }),
    });
    const data = (await response.json()) as GetAssetsByOwnerResponse;
    if (data.error || !data.result?.items) {
      return NextResponse.json({ credentials: [], error: data.error?.message ?? "DAS request failed" }, { status: 200 });
    }
    const collectionSet = new Set(collections);
    const credentials = data.result.items
      .filter((item) =>
        item.grouping?.some((g) => {
          // Helius may expose collection under slightly different keys depending on asset type.
          if (!g.group_key.toLowerCase().includes("collection")) return false;
          const groupValue = normalizeCollectionAddress(g.group_value);
          return groupValue ? collectionSet.has(groupValue) : false;
        })
      )
      .map(assetToCredentialInfo);
    return NextResponse.json({ credentials, warning: helius.warning });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ credentials: [], error: msg, warning: helius.warning }, { status: 200 });
  }
}
