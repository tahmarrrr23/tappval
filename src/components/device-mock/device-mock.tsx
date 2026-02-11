import type { AnalyzeResult } from "@lycorp-jp/tappy";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/libs/cn";

export interface DeviceMockProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  result: AnalyzeResult | null;
  loading?: boolean;
}

export const DeviceMock = (props: DeviceMockProps) => {
  const { result, loading, className, ...rest } = props;

  const [hoveredElement, setHoveredElement] = useState<
    NonNullable<AnalyzeResult["elements"]>[0] | null
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
  }, [result, loading, checkScroll]);

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
        <div className="flex items-center justify-center text-base-content/40 flex-col gap-4 p-8 text-center w-device-w h-device-h">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg" />
            <p className="font-bold animate-pulse text-base-content">
              CAPTURING...
            </p>
          </div>
        </div>
      );
    }

    if (!result || !result.screenshot) {
      return (
        <div className="flex items-center justify-center text-base-content/30 flex-col gap-4 p-8 text-center w-device-w h-device-h">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-16 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-bold uppercase tracking-widest">
            No data yet
          </p>
          <p className="text-xs opacity-60">Enter a URL and click Analyze</p>
        </div>
      );
    }

    const { device, elements, screenshot } = result;
    const imgSrc = screenshot.startsWith("data:")
      ? screenshot
      : `data:image/png;base64,${screenshot}`;

    const sortedElements = [...elements]
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

    return (
      <section
        ref={containerRef}
        className="relative"
        style={{
          width: device.width,
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
        <Image
          src={imgSrc}
          alt="Analyzed Screenshot"
          width={device.width}
          height={device.height}
          className="block w-full h-auto"
          unoptimized
        />
        {sortedElements.map((el, index) => {
          const borderColor = getBorderColor(el.tapSuccessRate);
          const isHovered = hoveredElement === el;

          return (
            <div
              key={`${index}-${el.left}-${el.top}`}
              className={cn(
                "absolute border-2 transition-all cursor-crosshair",
              )}
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
            <div className="bg-neutral text-neutral-content p-3 rounded-box shadow-xl backdrop-blur-sm border border-neutral-content/20 flex flex-col gap-1 min-w-50">
              <div className="flex justify-between items-center border-b border-neutral-content/20 pb-1 mb-1">
                <span className="text-xs font-mono opacity-60">
                  SUCCESS RATE
                </span>
                <span
                  className="font-bold text-lg"
                  style={{
                    color: getBorderColor(hoveredElement.tapSuccessRate),
                  }}
                >
                  {(hoveredElement.tapSuccessRate * 100).toFixed(2)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
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
    <div className={cn("mockup-phone", className)} {...rest}>
      <div className="mockup-phone-camera" />
      <div className="mockup-phone-display relative">
        <div
          ref={scrollRef}
          className="w-full h-full overflow-y-auto no-scrollbar bg-base-200"
          onScroll={checkScroll}
        >
          {renderContent()}
        </div>
        {/* Scroll hint overlay — inside the phone display */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 pointer-events-none transition-opacity duration-300 z-40",
            showScrollHint ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="bg-linear-to-t from-black/70 via-black/30 to-transparent px-4 pt-10 pb-4 flex flex-col items-center gap-1">
            <ChevronDownIcon className="size-5 text-white animate-bounce" />
            <span className="text-white text-xs font-bold tracking-wider uppercase">
              Scroll to explore
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
