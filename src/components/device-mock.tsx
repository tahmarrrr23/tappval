import type { AnalyzeResult } from "@lycorp-jp/tappy";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ScreenshotChunk = {
  src: string;
  y: number;
  width: number;
  height: number;
  sourceYOffset: number;
};

type AnalyzeResultWithChunks = AnalyzeResult & {
  screenshotChunks?: ScreenshotChunk[];
};

export interface DeviceMockProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  result: AnalyzeResultWithChunks | null;
  loading?: boolean;
}

function getScreenshotSrc(screenshot: unknown) {
  if (typeof screenshot !== "string") return null;

  const src = screenshot.trim();
  if (!src) return null;
  if (src.startsWith("data:")) {
    const [, payload = ""] = src.split(",", 2);
    return payload ? src : null;
  }

  return `data:image/webp;base64,${src}`;
}

export const DeviceMock = (props: DeviceMockProps) => {
  const { result, loading, className, ...rest } = props;

  const [hoveredElement, setHoveredElement] = useState<
    NonNullable<AnalyzeResultWithChunks["elements"]>[0] | null
  >(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight > el.clientHeight + 2;
    setCanScroll(scrollable);
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    setIsAtBottom(atBottom);
  }, []);

  useEffect(() => {
    checkScroll();
  }, [checkScroll]);

  const getHoverColor = (rate: number) => {
    if (rate < 0.8)
      return "color-mix(in oklch, var(--color-error) 30%, transparent)";
    if (rate < 0.95)
      return "color-mix(in oklch, var(--color-warning) 30%, transparent)";
    return "color-mix(in oklch, var(--color-success) 30%, transparent)";
  };

  const getBorderColor = (rate: number) => {
    if (rate < 0.8) return "var(--color-error)";
    if (rate < 0.95) return "var(--color-warning)";
    return "var(--color-success)";
  };

  const showScrollHint = canScroll && !isAtBottom && !!result && !loading;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-base-content/40">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-md text-primary" />
            <p className="text-sm font-medium text-base-content">
              Capturing page…
            </p>
          </div>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-base-content/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-12 text-primary/35"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>No data</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium text-base-content/55">
            Preview canvas is empty
          </p>
          <p className="max-w-52 text-xs leading-relaxed text-base-content/35">
            Enter a URL to capture the page and map its tap targets.
          </p>
        </div>
      );
    }

    const { device, elements, screenshot } = result;
    const screenshotChunks = (result.screenshotChunks ?? [])
      .map((chunk) => ({
        ...chunk,
        src: getScreenshotSrc(chunk.src),
      }))
      .filter(
        (
          chunk,
        ): chunk is ScreenshotChunk & {
          src: string;
        } => !!chunk.src && chunk.width > 0 && chunk.height > 0,
      );
    const imgSrc =
      screenshotChunks.length > 0
        ? screenshotChunks[0].src
        : getScreenshotSrc(screenshot);

    if (!imgSrc) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-base-content/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-12 text-warning/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Invalid screenshot</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.5 13.5l5-5M9.5 8.5l5 5"
            />
          </svg>
          <p className="text-sm font-medium text-base-content/55">
            Capture could not be displayed
          </p>
          <p className="max-w-60 text-xs leading-relaxed text-base-content/35">
            The analysis completed, but the screenshot payload was not a
            displayable image.
          </p>
        </div>
      );
    }

    const sortedElements = [...(Array.isArray(elements) ? elements : [])]
      .filter((el) => {
        const isFullWidth = el.width >= device.width * 0.9;
        const isFullHeight = el.height >= device.height * 0.9;
        return !(isFullWidth && isFullHeight);
      })
      .sort((a, b) => {
        const areaA = a.width * a.height;
        const areaB = b.width * b.height;
        return areaB - areaA;
      });
    const elementKeyCounts = new Map<string, number>();
    const keyedElements = sortedElements.map((el) => {
      const baseKey = `${el.left}-${el.top}-${el.width}-${el.height}`;
      const occurrence = elementKeyCounts.get(baseKey) ?? 0;
      elementKeyCounts.set(baseKey, occurrence + 1);
      return {
        element: el,
        key: `${baseKey}-${occurrence}`,
      };
    });
    const screenshotHeight =
      screenshotChunks.length > 0
        ? Math.max(...screenshotChunks.map((chunk) => chunk.y + chunk.height))
        : undefined;

    return (
      <section
        ref={containerRef}
        className={cn(
          "relative max-w-full shrink-0",
          screenshotChunks.length > 0 && "overflow-hidden",
        )}
        style={{
          width: device.width,
          height: screenshotHeight,
        }}
        onMouseLeave={() => setHoveredElement(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setCursorPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        aria-label="Analysis Result"
      >
        {screenshotChunks.length > 0 ? (
          screenshotChunks.map((chunk) => (
            <div
              key={`${chunk.y}-${chunk.height}-${chunk.sourceYOffset}`}
              className="absolute left-0 overflow-hidden"
              style={{
                top: chunk.y,
                width: device.width,
                height: chunk.height,
              }}
            >
              {/* biome-ignore lint/performance/noImgElement: these are generated data URI screenshot chunks; next/image requires fixed dimensions and cannot represent source cropping cleanly. */}
              <img
                src={chunk.src}
                alt=""
                width={device.width}
                className="block w-full h-auto"
                style={{
                  transform:
                    chunk.sourceYOffset > 0
                      ? `translateY(-${chunk.sourceYOffset}px)`
                      : undefined,
                }}
              />
            </div>
          ))
        ) : (
          <>
            {/* biome-ignore lint/performance/noImgElement: data URI screenshots have dynamic full-page height, so next/image's required height distorts the rendered aspect ratio. */}
            <img
              src={imgSrc}
              alt="Analyzed Screenshot"
              width={device.width}
              className="block w-full h-auto"
            />
          </>
        )}
        {keyedElements.map(({ element: el, key }) => {
          const borderColor = getBorderColor(el.tapSuccessRate);
          const isHovered = hoveredElement === el;

          return (
            <div
              key={key}
              className="absolute cursor-crosshair border-2 transition-colors duration-100"
              style={{
                left: el.left,
                top: el.top,
                width: el.width,
                height: el.height,
                borderColor: borderColor,
                backgroundColor: isHovered
                  ? getHoverColor(el.tapSuccessRate)
                  : "transparent",
                zIndex: isHovered ? 10 : 1,
              }}
              onMouseEnter={() => setHoveredElement(el)}
              onMouseLeave={() => setHoveredElement(null)}
              role="img"
              aria-label={`Element at ${el.left},${el.top}`}
            />
          );
        })}

        {hoveredElement && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: Math.min(cursorPos.x + 16, device.width - 220),
              top: Math.min(
                cursorPos.y + 16,
                (containerRef.current?.clientHeight ?? Infinity) - 100,
              ),
            }}
          >
            <div className="flex min-w-50 flex-col gap-1 rounded-sm border border-neutral-content/20 bg-neutral p-3 text-neutral-content">
              <div className="mb-1.5 flex items-center justify-between border-b border-neutral-content/20 pb-1.5">
                <span className="font-mono text-[10px] font-medium opacity-60">
                  Success Rate
                </span>
                <span
                  className="font-mono text-lg font-semibold tabular-nums"
                  style={{
                    color: getBorderColor(hoveredElement.tapSuccessRate),
                  }}
                >
                  {(hoveredElement.tapSuccessRate * 100).toFixed(2)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
                <span className="opacity-60">Size (px):</span>
                <span>
                  {Math.round(hoveredElement.width)} x{" "}
                  {Math.round(hoveredElement.height)}
                </span>
                <span className="opacity-60">Size (mm):</span>
                <span>
                  {hoveredElement.widthMm.toFixed(1)} x{" "}
                  {hoveredElement.heightMm.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  };

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-md border border-base-300 bg-base-100",
        className,
      )}
      {...rest}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-base-300 bg-base-100 px-3.5">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="font-mono text-[10px] font-medium text-base-content/60">
            CAPTURE CANVAS
          </span>
        </div>
        <span className="font-mono text-[10px] text-base-content/35">
          {loading
            ? "CAPTURING"
            : result?.device
              ? `${result.device.width} × ${result.device.height} PX`
              : "NO CAPTURE"}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="no-scrollbar flex flex-1 flex-col overflow-y-auto bg-base-200/60"
        onScroll={checkScroll}
      >
        {renderContent()}
      </div>
      {/* Scroll hint overlay */}
      <div
        className={cn(
          "pointer-events-none absolute right-0 bottom-0 left-0 z-40 transition-opacity duration-200",
          showScrollHint ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex flex-col items-center gap-1 bg-linear-to-t from-base-content/75 via-base-content/30 to-transparent px-4 pt-10 pb-4">
          <ChevronDownIcon className="size-4 text-base-100" />
          <span className="font-mono text-[10px] font-medium text-base-100">
            Scroll to explore
          </span>
        </div>
      </div>
    </div>
  );
};
