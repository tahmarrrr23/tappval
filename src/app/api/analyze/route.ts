import { Buffer } from "node:buffer";
import puppeteer from "@cloudflare/puppeteer";
import { type Device, Tappy } from "@lycorp-jp/tappy";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CloudflarePuppeteerAdapter } from "@/lib/cloudflare-puppeteer-adapter";

const DEFAULT_WIDTH = 390;
const DEFAULT_HEIGHT = 844;
const SCALE_FACTOR = 3;
const PPI = 460;
const SCREENSHOT_MIME_TYPE = "image/webp";
const MAX_SCREENSHOT_HEIGHT = 50_000;

type BrowserLike = Awaited<ReturnType<typeof puppeteer.launch>>;

type BufferJson = {
  type: "Buffer";
  data: number[];
};

type ScreenshotOptions = Parameters<
  Awaited<ReturnType<BrowserLike["newPage"]>>["screenshot"]
>[0];

type ScreenshotChunk = {
  src: string;
  y: number;
  width: number;
  height: number;
  sourceYOffset: number;
};

function buildDevice(searchParams: URLSearchParams): Device {
  const rawW = Number(searchParams.get("width"));
  const rawH = Number(searchParams.get("height"));
  const width = Math.min(Math.max(rawW || DEFAULT_WIDTH, 200), 1920);
  const height = Math.min(Math.max(rawH || DEFAULT_HEIGHT, 200), 10000);
  return { width, height, scaleFactor: SCALE_FACTOR, ppi: PPI };
}

async function getBrowser() {
  const { env } = getCloudflareContext();
  if (env.BROWSER) return puppeteer.launch(env.BROWSER);

  try {
    const importModule = new Function(
      "specifier",
      "return import(specifier)",
    ) as (specifier: string) => Promise<{
      default: { launch: () => Promise<BrowserLike> };
    }>;
    const localPuppeteer = await importModule("puppeteer");
    return localPuppeteer.default.launch();
  } catch {
    throw new Error(
      "Cloudflare Browser binding is unavailable. Install puppeteer for local fallback, or run through the OpenNext Cloudflare preview/dev environment.",
    );
  }
}

function isBufferJson(value: unknown): value is BufferJson {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "data" in value &&
    value.type === "Buffer" &&
    Array.isArray(value.data)
  );
}

function normalizeScreenshotDataUri(
  screenshot: unknown,
  mimeType = SCREENSHOT_MIME_TYPE,
) {
  if (typeof screenshot === "string") {
    const trimmed = screenshot.trim();
    if (trimmed.startsWith("data:")) {
      const [, payload = ""] = trimmed.split(",", 2);
      if (!payload) throw new Error("Browser returned an empty screenshot");
      return trimmed;
    }
    if (!trimmed) throw new Error("Browser returned an empty screenshot");
    return `data:${mimeType};base64,${trimmed}`;
  }

  if (screenshot instanceof Uint8Array) {
    if (screenshot.byteLength === 0) {
      throw new Error("Browser returned an empty screenshot");
    }
    return `data:${mimeType};base64,${Buffer.from(screenshot).toString("base64")}`;
  }

  if (isBufferJson(screenshot)) {
    if (screenshot.data.length === 0) {
      throw new Error("Browser returned an empty screenshot");
    }
    return `data:${mimeType};base64,${Buffer.from(screenshot.data).toString("base64")}`;
  }

  throw new Error("Unexpected screenshot payload returned from browser");
}

async function getViewportScreenshotDataUri(
  page: Awaited<ReturnType<BrowserLike["newPage"]>>,
  options: ScreenshotOptions,
) {
  let lastError: unknown;

  for (const type of ["webp", "png"] as const) {
    try {
      return normalizeScreenshotDataUri(
        await page.screenshot({
          ...options,
          type,
          fullPage: false,
          captureBeyondViewport: false,
        }),
        `image/${type}`,
      );
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error("Browser returned an empty screenshot");
}

async function getPageScreenshotChunks(
  page: Awaited<ReturnType<BrowserLike["newPage"]>>,
  options: ScreenshotOptions,
): Promise<ScreenshotChunk[]> {
  const viewport = page.viewport();
  const scrollSize = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
  }));
  const width = viewport?.width || scrollSize.width || DEFAULT_WIDTH;
  const viewportHeight = viewport?.height || DEFAULT_HEIGHT;
  const pageHeight = Math.min(
    scrollSize.height || viewportHeight,
    MAX_SCREENSHOT_HEIGHT,
  );
  const maxScrollTop = Math.max(0, pageHeight - viewportHeight);
  const chunks: ScreenshotChunk[] = [];
  const desiredOffsets = new Set<number>();

  for (let y = 0; y < pageHeight; y += viewportHeight) {
    desiredOffsets.add(y);
  }
  desiredOffsets.add(maxScrollTop);

  for (const desiredY of [...desiredOffsets].sort((a, b) => a - b)) {
    const captureY = Math.min(desiredY, maxScrollTop);
    const sourceYOffset = desiredY - captureY;
    const height = Math.min(
      viewportHeight - sourceYOffset,
      pageHeight - desiredY,
    );

    if (height <= 0) continue;

    await page.evaluate((top) => window.scrollTo(0, top), captureY);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );

    chunks.push({
      src: await getViewportScreenshotDataUri(page, options),
      y: desiredY,
      width,
      height,
      sourceYOffset,
    });
  }

  await page.evaluate(() => window.scrollTo(0, 0));

  return chunks;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }

  const device = buildDevice(searchParams);

  const browser = await getBrowser();
  try {
    const page = await browser.newPage();

    const adapter = new CloudflarePuppeteerAdapter(page);
    await adapter.page.setViewport({
      width: device.width,
      height: device.height,
      deviceScaleFactor: device.scaleFactor,
      isMobile: true,
    });
    await adapter.page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30_000,
    });

    const tappy = new Tappy(adapter);
    const result = await tappy.analyze(device);

    // tappy の captureBeyondViewport: true はビューポート外のコンテンツを
    // 繰り返し描画する Chrome バグを踏むため、独自スクリーンショットで差し替え
    const screenshotChunks = await getPageScreenshotChunks(page, {
      type: "webp",
      encoding: "base64",
    });

    return Response.json({
      ...result,
      screenshot: screenshotChunks[0]?.src ?? "",
      screenshotChunks,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  } finally {
    await browser.close();
  }
}
