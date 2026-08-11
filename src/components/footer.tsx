import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export interface FooterProps extends ComponentPropsWithoutRef<"footer"> {}

export const Footer = (props: FooterProps) => {
  const { className, ...rest } = props;

  return (
    <footer
      className={cn(
        "flex w-full max-w-6xl items-center justify-center border-t border-base-300 bg-base-100/90 px-1 pt-3 text-center text-[11px] text-base-content/45",
        className,
      )}
      {...rest}
    >
      <p>
        &copy; {new Date().getFullYear()} Fumiya Yamashita. All rights reserved.
      </p>
    </footer>
  );
};
