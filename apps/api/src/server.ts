import dns from "node:dns/promises";
import net from "node:net";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import cors from "@fastify/cors";
import Fastify from "fastify";

type Target = { expiresAt: number; url: URL };

const app = Fastify({ logger: true });
await app.register(cors, {
  origin: process.env.CLIENT_URL ?? "http://localhost:5173",
});
const targets = new Map<string, Target>();
const targetTtlMs = 5 * 60 * 1000;
const allowedHosts = new Set(
  (process.env.IPTV_PROXY_ALLOWED_HOSTS ?? "uexme.pics")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),
);

function isPrivateAddress(address: string) {
  const version = net.isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 0
    );
  }
  return (
    address === "::1" ||
    address.startsWith("fc") ||
    address.startsWith("fd") ||
    address.startsWith("fe80:")
  );
}

async function validateTarget(rawUrl: unknown) {
  if (typeof rawUrl !== "string") throw new Error("INVALID_TARGET");
  const url = new URL(rawUrl);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("UNSUPPORTED_PROTOCOL");
  if (!allowedHosts.has(url.hostname.toLowerCase()))
    throw new Error("HOST_NOT_ALLOWED");
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (addresses.some(({ address }) => isPrivateAddress(address)))
    throw new Error("PRIVATE_TARGET");
  return url;
}

async function validateRedirect(rawUrl: string, previous: URL) {
  const url = new URL(rawUrl, previous);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("UNSUPPORTED_REDIRECT_PROTOCOL");
  const hostname = url.hostname.toLowerCase();
  if (allowedHosts.has(hostname)) return url;
  if (!net.isIP(hostname) || !allowedHosts.has(previous.hostname.toLowerCase()))
    throw new Error("REDIRECT_HOST_NOT_ALLOWED");
  const addresses = await dns.lookup(hostname, { all: true });
  if (addresses.some(({ address }) => isPrivateAddress(address)))
    throw new Error("REDIRECT_PRIVATE_TARGET");
  return url;
}

async function fetchMedia(url: URL, range: string | undefined) {
  let current = url;
  let finalReached = false;
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let response: Response;
    try {
      response = await fetch(current, {
        headers: range ? { Range: range } : undefined,
        redirect: "manual",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      finalReached = true;
      break;
    }
    const location = response.headers.get("location");
    if (!location) return response;
    current = await validateRedirect(location, current);
    if (net.isIP(current.hostname)) {
      finalReached = true;
      break;
    }
  }
  if (!finalReached) throw new Error("TOO_MANY_REDIRECTS");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    return await fetch(url, {
      headers: range ? { Range: range } : undefined,
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function cleanupTargets() {
  const now = Date.now();
  for (const [id, target] of targets)
    if (target.expiresAt <= now) targets.delete(id);
}

app.post<{ Body: { url?: string } }>(
  "/media-targets",
  async (request, reply) => {
    try {
      const url = await validateTarget(request.body?.url);
      cleanupTargets();
      if (targets.size >= 100)
        return reply
          .code(429)
          .send({ message: "Too many active media targets" });
      const targetId = crypto.randomUUID();
      targets.set(targetId, { expiresAt: Date.now() + targetTtlMs, url });
      return reply
        .code(201)
        .send({ targetId, expiresAt: Date.now() + targetTtlMs });
    } catch {
      return reply.code(400).send({ message: "Invalid media target" });
    }
  },
);

app.get<{ Params: { targetId: string } }>(
  "/media/:targetId",
  async (request, reply) => {
    cleanupTargets();
    const target = targets.get(request.params.targetId);
    if (!target)
      return reply.code(404).send({ message: "Media target expired" });
    try {
      const response = await fetchMedia(target.url, request.headers.range);
      if (!response.ok || !response.body)
        return reply
          .code(response.status)
          .send({ message: "Media unavailable" });
      reply.code(response.status);
      reply.header("Cache-Control", "no-store");
      reply.header(
        "Access-Control-Allow-Origin",
        process.env.CLIENT_URL ?? "http://localhost:5173",
      );
      for (const header of [
        "content-type",
        "content-length",
        "content-range",
        "accept-ranges",
      ]) {
        const value = response.headers.get(header);
        if (value) reply.header(header, value);
      }
      const body = Readable.fromWeb(
        response.body as unknown as NodeReadableStream,
      );
      reply.raw.on("close", () => {
        if (!reply.raw.writableFinished) body.destroy();
      });
      return reply.send(body);
    } catch {
      return reply.code(502).send({ message: "Media unavailable" });
    }
  },
);

app.get("/health", async () => ({ status: "ok" }));

await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3333) });
