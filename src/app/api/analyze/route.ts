import { type Device, Tappy } from "@lycorp-jp/tappy";
import { PuppeteerAdapter } from "@lycorp-jp/tappy/adapters";
import puppeteer from "puppeteer";

const DEVICE: Device = {
  width: 390,
  height: 844,
  scaleFactor: 3,
  ppi: 460,
};

export async function GET() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const adapter = new PuppeteerAdapter(page);
  await adapter.page.setViewport({
    width: DEVICE.width,
    height: DEVICE.height,
    deviceScaleFactor: DEVICE.scaleFactor,
    isMobile: true,
  });
  await adapter.page.goto("https://example.com/");

  const tappy = new Tappy(adapter);
  const result = await tappy.analyze(DEVICE);

  return Response.json(result);
}
