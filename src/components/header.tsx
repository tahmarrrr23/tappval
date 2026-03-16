import { ExternalLinkIcon } from "@radix-ui/react-icons";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export interface HeaderProps extends ComponentPropsWithoutRef<"header"> {}

export const Header = (props: HeaderProps) => {
  const { className, ...rest } = props;

  return (
    <header
      className={cn(
        "navbar bg-base-100 border-2 border-black shadow-neo max-w-6xl w-full px-6",
        className,
      )}
      {...rest}
    >
      <div className="navbar-start">
        <a
          href="/"
          className="flex flex-col gap-0.5 hover:opacity-80 transition-opacity"
        >
          <span className="text-4xl font-black tracking-tighter leading-none">
            tappval
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-base-content/50 font-bold">
            Playground for Tappy
          </span>
        </a>
      </div>
      <div className="navbar-end gap-2">
        <a
          href="https://github.com/tahmarrrr23/tappval"
          className="btn btn-sm border-2 border-black font-bold uppercase text-xs tracking-wider hover:-translate-y-0.5 hover:shadow-neo-sm active:translate-y-0 active:shadow-none transition-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source
          <ExternalLinkIcon />
        </a>
        <a
          href="https://github.com/yahoojapan/tappy"
          className="btn btn-sm border-2 border-black font-bold uppercase text-xs tracking-wider hover:-translate-y-0.5 hover:shadow-neo-sm active:translate-y-0 active:shadow-none transition-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tappy
          <ExternalLinkIcon />
        </a>
      </div>
    </header>
  );
};
