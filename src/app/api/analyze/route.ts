import { type Device, Tappy } from "@lycorp-jp/tappy";
import { PuppeteerAdapter } from "@lycorp-jp/tappy/adapters";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

const DEVICE: Device = {
  width: 390,
  height: 844,
  scaleFactor: 3,
  ppi: 460,
};

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

  const browser = await getBrowser();
  const page = await browser.newPage();

  const adapter = new PuppeteerAdapter(page);
  await adapter.page.setViewport({
    width: DEVICE.width,
    height: DEVICE.height,
    deviceScaleFactor: DEVICE.scaleFactor,
    isMobile: true,
  });
  await adapter.page.goto(url);

  const tappy = new Tappy(adapter);
  const result = await tappy.analyze(DEVICE);

  await browser.close();

  return Response.json(result);
}
