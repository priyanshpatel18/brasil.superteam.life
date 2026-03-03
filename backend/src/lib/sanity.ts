import { createClient } from "@sanity/client";

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

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

