import type { AnalyzeResult } from "@lycorp-jp/tappy";
import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { useRef, useState } from "react";
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

  const renderContent = () => {
    if (loading) {
      return (
        <div
          className={cn(
            "flex items-center justify-center text-gray-400 flex-col gap-4 p-8 text-center border-2 border-dashed border-gray-300 m-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] rounded-2xl",
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg text-black" />
            <p className="text-black font-bold animate-pulse">CAPTURING...</p>
          </div>
        </div>
      );
    }

    if (!result || !result.screenshot) {
      return (
        <div
          className={cn(
            "flex items-center justify-center text-gray-400 flex-col gap-4 p-8 text-center border-2 border-dashed border-gray-300 m-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] rounded-2xl",
          )}
        >
          <span className="text-6xl opacity-20">NO DATA</span>
          <p className="text-sm uppercase tracking-widest">
            Waiting for input...
          </p>
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
            <div
              className={cn(
                "bg-black/90 text-white p-3 rounded shadow-xl backdrop-blur-sm border border-white/20 flex flex-col gap-1 min-w-50",
              )}
            >
              <div className="flex justify-between items-center border-b border-white/20 pb-1 mb-1">
                <span className="text-xs font-mono text-gray-400">
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
                <span className="text-gray-400">Size (px):</span>
                <span>
                  {Math.round(hoveredElement.width)} x{" "}
                  {Math.round(hoveredElement.height)}
                </span>
                <span className="text-gray-400">Size (mm):</span>
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
        "w-device-w h-device-h relative overflow-hidden bg-white border-4 border-black rounded-md shadow-xl box-content",
        className,
      )}
      {...rest}
    >
      <div
        className={cn("w-full h-full overflow-y-auto no-scrollbar bg-gray-50")}
      >
        {renderContent()}
      </div>
    </div>
  );
};
