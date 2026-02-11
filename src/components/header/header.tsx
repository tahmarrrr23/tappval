import { ExternalLinkIcon } from "@radix-ui/react-icons";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/libs/cn";

export interface HeaderProps extends ComponentPropsWithoutRef<"header"> {}

export const Header = (props: HeaderProps) => {
  const { className, ...rest } = props;

  return (
    <header
      className={cn(
        "navbar bg-base-100 border-b-2 border-base-300 max-w-6xl w-full px-4",
        className,
      )}
      {...rest}
    >
      <div className="navbar-start">
        <div className="flex flex-col">
          <a
            href="/"
            className="text-3xl font-bold tracking-tighter hover:opacity-80 transition-opacity"
          >
            tappval
          </a>
          <span className="text-xs text-base-content/50 tracking-wide">
            Playground for Tappy
          </span>
        </div>
      </div>
      <div className="navbar-end gap-1">
        <a
          href="https://github.com/tahmarrrr23/tappval"
          className="btn btn-ghost btn-sm gap-1 font-bold"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source
          <ExternalLinkIcon />
        </a>
        <a
          href="https://github.com/yahoojapan/tappy"
          className="btn btn-ghost btn-sm gap-1 font-bold"
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
