import { ExternalLinkIcon } from "@radix-ui/react-icons";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export interface HeaderProps extends ComponentPropsWithoutRef<"header"> {}

export const Header = (props: HeaderProps) => {
  const { className, ...rest } = props;

  return (
    <header
      className={cn(
        "flex min-h-18 w-full max-w-6xl items-center justify-between border-b border-base-300 bg-base-100/90 px-2 py-3",
        className,
      )}
      {...rest}
    >
      <div>
        <a href="/" className="group flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-sm bg-primary transition-colors duration-150 group-hover:bg-base-content">
            <span className="select-none font-mono text-lg font-semibold text-primary-content">
              t.
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[22px] font-semibold leading-none tracking-[-0.03em]">
              tappval
            </h1>
            <span className="hidden text-[11px] text-base-content/55 sm:block">
              Playground for Tappy
            </span>
          </div>
        </a>
      </div>
      <nav className="flex items-center gap-1" aria-label="Project links">
        <a
          href="https://github.com/tahmarrrr23/tappval"
          className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-sm px-3.5 text-sm font-medium text-base-content/70 transition-colors duration-150 hover:bg-base-200 hover:text-base-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source
          <ExternalLinkIcon />
        </a>
        <a
          href="https://github.com/yahoojapan/tappy"
          className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-sm px-3.5 text-sm font-medium text-base-content/70 transition-colors duration-150 hover:bg-base-200 hover:text-base-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tappy
          <ExternalLinkIcon />
        </a>
      </nav>
    </header>
  );
};
