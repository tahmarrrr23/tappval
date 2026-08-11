import puppeteer from "@cloudflare/puppeteer";
import { type Device, Tappy } from "@lycorp-jp/tappy";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CloudflarePuppeteerAdapter } from "@/lib/cloudflare-puppeteer-adapter";

const DEFAULT_WIDTH = 390;
const DEFAULT_HEIGHT = 844;
const SCALE_FACTOR = 3;
const PPI = 460;

function buildDevice(searchParams: URLSearchParams): Device {
  const rawW = Number(searchParams.get("width"));
  const rawH = Number(searchParams.get("height"));
  const width = Math.min(Math.max(rawW || DEFAULT_WIDTH, 200), 1920);
  const height = Math.min(Math.max(rawH || DEFAULT_HEIGHT, 200), 10000);
  return { width, height, scaleFactor: SCALE_FACTOR, ppi: PPI };
}

async function getBrowser() {
  const { env } = getCloudflareContext();
  return puppeteer.launch(env.BROWSER);
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
    const screenshot = await page.screenshot({
      fullPage: true,
      type: "webp",
      encoding: "base64",
    });

    result.screenshot = screenshot;
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  } finally {
    await browser.close();
  }
}
