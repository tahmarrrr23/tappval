import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export interface FooterProps extends ComponentPropsWithoutRef<"footer"> {}

export const Footer = (props: FooterProps) => {
  const { className, ...rest } = props;

  return (
    <footer
      className={cn(
        "border-2",
        "border-black",
        "bg-base-100",
        "p-6",
        "w-full",
        "max-w-6xl",
        "shadow-neo",
        "text-center",
        className,
      )}
      {...rest}
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-base-content/50 font-bold">
        &copy; {new Date().getFullYear()} Fumiya Yamashita. All rights reserved.
      </p>
    </footer>
  );
};
