import { type Device, Tappy } from "@lycorp-jp/tappy";
import { PuppeteerAdapter } from "@lycorp-jp/tappy/adapters";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

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
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(
        `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/chromium-pack.tar`,
      ),
    });
  } else {
    return await puppeteer.launch({
      channel: "chrome",
    });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }

  const device = buildDevice(searchParams);

  const browser = await getBrowser();
  const page = await browser.newPage();

  const adapter = new PuppeteerAdapter(page);
  await adapter.page.setViewport({
    width: device.width,
    height: device.height,
    deviceScaleFactor: device.scaleFactor,
    isMobile: true,
  });
  await adapter.page.goto(url);

  const tappy = new Tappy(adapter);
  const result = await tappy.analyze(device);

  await browser.close();

  return Response.json(result);
}
