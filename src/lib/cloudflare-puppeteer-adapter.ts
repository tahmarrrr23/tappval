// SPDX-License-Identifier: Apache-2.0
// Adapted from @lycorp-jp/tappy's PuppeteerAdapter and browser detector.
import type { Page } from "@cloudflare/puppeteer";
import type { TappableElement } from "@lycorp-jp/tappy";
import { PuppeteerAdapter } from "@lycorp-jp/tappy/adapters";

const ACCEPTED_TAG_NAMES = ["BUTTON", "INPUT", "SELECT", "TEXTAREA"];
const ACCEPTED_EVENT_NAMES = [
  "touchstart",
  "touchend",
  "touchcancel",
  "touchmove",
  "pointerover",
  "pointerenter",
  "pointerdown",
  "pointermove",
  "pointerup",
  "pointercancel",
  "pointerout",
  "pointerleave",
  "gotpointercapture",
  "lostpointercapture",
  "auxclick",
  "beforeinput",
  "blur",
  "click",
  "compositionend",
  "compositionstart",
  "compositionupdate",
  "contextmenu",
  "dblclick",
  "focus",
  "focusin",
  "focusout",
  "input",
  "keydown",
  "keypress",
  "keyup",
  "mousedown",
  "mouseenter",
  "mouseleave",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "wheel",
];

declare function getEventListeners(element: Element): Record<string, unknown>;

// This is Tappy's detector, evaluated through CDP so it can use the DevTools-only
// getEventListeners API without reading detector.js from a Node.js filesystem.
function detectTappableElements(
  acceptedTagNames: string[],
  acceptedEventNames: string[],
) {
  const rectInRect = (small: DOMRect, large: DOMRect) =>
    large.left <= small.left &&
    large.top <= small.top &&
    small.right <= large.right &&
    small.bottom <= large.bottom;

  const isHidden = (element: Element) => {
    let target: Element | null = element;
    while (target !== null) {
      const style = getComputedStyle(target);
      if (style.visibility === "hidden" || style.opacity === "0") return true;
      target = target.parentElement;
    }
    return false;
  };

  const elements: Element[] = [];
  for (const element of document.querySelectorAll(
    ":not(html, head, link, title, style, script, meta, body, a)",
  )) {
    if (isHidden(element)) continue;
    const eventNames = Object.keys(getEventListeners(element));
    if (
      !acceptedTagNames.includes(element.tagName) &&
      !eventNames.some((name) => acceptedEventNames.includes(name))
    ) {
      continue;
    }
    element.setAttribute("data-tappy", "");
    elements.push(element);
  }

  for (const element of document.querySelectorAll("label:not([data-tappy])")) {
    if (isHidden(element)) continue;
    const targetId = element.getAttribute("for");
    if (targetId && document.getElementById(targetId)) elements.push(element);
  }

  for (const anchor of document.querySelectorAll("a")) {
    let childIsLargerThanParent = false;
    const anchorRect = anchor.getBoundingClientRect();
    for (const child of anchor.children) {
      const childRect = child.getBoundingClientRect();
      if (rectInRect(childRect, anchorRect)) continue;
      if (rectInRect(anchorRect, childRect)) childIsLargerThanParent = true;
      elements.push(child);
    }
    if (!childIsLargerThanParent) elements.push(anchor);
  }

  return JSON.stringify(
    elements.map((element) => element.getBoundingClientRect()),
  );
}

export class CloudflarePuppeteerAdapter extends PuppeteerAdapter {
  public constructor(page: Page) {
    super(page as never);
  }

  override async getTappableElements(): Promise<TappableElement[]> {
    const ratio =
      (this.page.viewport()?.width ?? 0) /
      (await this.page.evaluate(() => window.innerWidth));
    const origin = await this.page.evaluate(
      () =>
        document.documentElement.getBoundingClientRect().toJSON() as DOMRect,
    );
    const cdp = await this.page.createCDPSession();
    const { result } = await cdp.send("Runtime.evaluate", {
      expression: `(${detectTappableElements.toString()})(${JSON.stringify(ACCEPTED_TAG_NAMES)}, ${JSON.stringify(ACCEPTED_EVENT_NAMES)})`,
      includeCommandLineAPI: true,
    });

    if (typeof result.value !== "string") return [];

    return (JSON.parse(result.value) as DOMRect[])
      .filter((rect) => rect.width !== 0 && rect.height !== 0)
      .map((rect) => ({
        width: rect.width * ratio,
        height: rect.height * ratio,
        left: (rect.left - origin.left) * ratio,
        top: (rect.top - origin.top) * ratio,
      }));
  }
}
