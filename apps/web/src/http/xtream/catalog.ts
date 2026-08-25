import { z } from "zod";
import {
  type CatalogItem,
  type CatalogSeries,
  type CatalogSource,
  catalogItemSchema,
  catalogSeriesSchema,
  sourceSchema,
} from "../../features/catalog/catalog";
import { httpClient } from "../client";

const responseSchema = z.object({
  source: sourceSchema,
  items: z.array(catalogItemSchema),
  series: z.array(catalogSeriesSchema),
});

export async function importXtreamCatalog(input: {
  name: string;
  server: string;
  username: string;
  password: string;
}): Promise<{
  source: CatalogSource;
  items: CatalogItem[];
  series: CatalogSeries[];
}> {
  const response = await httpClient.post("/xtream/catalog", input);
  return responseSchema.parse(response.data);
}

export async function refreshXtreamCatalog(sourceId: string, name: string) {
  const response = await httpClient.post(
    `/xtream/catalog/${encodeURIComponent(sourceId)}/refresh`,
    { name },
  );
  return responseSchema.parse(response.data);
}

export async function fetchXtreamMovieDetails(
  sourceId: string,
  providerId: string,
) {
  const response = await httpClient.get(
    `/xtream/catalog/${encodeURIComponent(sourceId)}/movie/${encodeURIComponent(providerId)}`,
  );
  return response.data as {
    info?: Record<string, unknown>;
  };
}

export async function fetchXtreamSeriesDetails(
  sourceId: string,
  providerId: string,
) {
  const response = await httpClient.get(
    `/xtream/catalog/${encodeURIComponent(sourceId)}/series/${encodeURIComponent(providerId)}`,
  );
  return response.data as {
    info?: Record<string, unknown>;
    episodes: CatalogItem[];
  };
}
