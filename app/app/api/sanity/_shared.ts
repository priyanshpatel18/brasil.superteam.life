import * as jose from "jose";
import { createClient } from "@sanity/client";

export const JWT_ISSUER = "academy-admin";
export const JWT_AUDIENCE = "academy-admin";

export async function verifyAdminToken(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_JWT_SECRET ?? "";
  if (!secret || secret.length < 32) return false;
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, key, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload.sub === "admin";
  } catch {
    return false;
  }
}

export function getSanityWriteClient() {
  const projectId = process.env.SANITY_PROJECT_ID?.trim();
  const dataset = process.env.SANITY_DATASET?.trim();
  const apiVersion = (process.env.SANITY_API_VERSION ?? "2025-01-01").trim();
  const token = process.env.SANITY_API_TOKEN?.trim();

  if (!projectId || !dataset) {
    throw new Error("SANITY_PROJECT_ID and SANITY_DATASET are required");
  }
  if (!token) {
    throw new Error("SANITY_API_TOKEN is required");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}

