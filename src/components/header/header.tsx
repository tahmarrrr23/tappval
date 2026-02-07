import { ExternalLinkIcon } from "@radix-ui/react-icons";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/libs/cn";

export interface HeaderProps extends ComponentPropsWithoutRef<"header"> {}

export const Header = (props: HeaderProps) => {
  const { className, ...rest } = props;

  return (
    <header
      className={cn("w-full", "max-w-6xl", "border-b-4", "p-4", className)}
      {...rest}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-bold tracking-tighter">
          <a href="/" className="link no-underline font-bold">
            tappval
          </a>
        </h1>

        <div className="space-x-4">
          <a
            href="https://github.com/tahmarrrr23/tappval"
            className={cn("link", "link-hover", "join", "font-bold")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source
            <ExternalLinkIcon className="join-item" />
          </a>
          <a
            href="https://github.com/yahoojapan/tappy"
            className={cn("link", "link-hover", "join", "font-bold")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tappy
            <ExternalLinkIcon className="join-item" />
          </a>
        </div>
      </div>
    </header>
  );
};
