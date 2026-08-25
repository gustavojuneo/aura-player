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

function credentialsFor(source: CatalogSource) {
  if (
    source.type !== "xtream" ||
    !source.server ||
    !source.username ||
    !source.password
  ) {
    throw new Error("As credenciais da fonte não estão disponíveis.");
  }
  return {
    password: source.password,
    server: source.server,
    username: source.username,
  };
}

export async function refreshXtreamCatalog(source: CatalogSource) {
  const credentials = credentialsFor(source);
  const response = await httpClient.post(
    `/xtream/catalog/${encodeURIComponent(source.id)}/refresh`,
    { ...credentials, name: source.name },
  );
  return responseSchema.parse(response.data);
}

export async function fetchXtreamMovieDetails(
  source: CatalogSource,
  providerId: string,
) {
  const credentials = credentialsFor(source);
  const response = await httpClient.post(
    `/xtream/catalog/${encodeURIComponent(source.id)}/movie/${encodeURIComponent(providerId)}`,
    credentials,
  );
  return response.data as {
    info?: Record<string, unknown>;
  };
}

export async function fetchXtreamSeriesDetails(
  source: CatalogSource,
  providerId: string,
) {
  const credentials = credentialsFor(source);
  const response = await httpClient.post(
    `/xtream/catalog/${encodeURIComponent(source.id)}/series/${encodeURIComponent(providerId)}`,
    credentials,
  );
  return response.data as {
    info?: Record<string, unknown>;
    episodes: CatalogItem[];
  };
}
