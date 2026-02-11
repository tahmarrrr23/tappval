import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/libs/cn";

export interface FooterProps extends ComponentPropsWithoutRef<"footer"> {}

export const Footer = (props: FooterProps) => {
  const { className, ...rest } = props;

  return (
    <footer
      className={cn(
        "footer",
        "footer-center",
        "bg-base-200",
        "text-base-content",
        "p-6",
        "w-full",
        "max-w-6xl",
        "rounded-box",
        className,
      )}
      {...rest}
    >
      <aside>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Fumiya Yamashita. All rights
          reserved.
        </p>
      </aside>
    </footer>
  );
};
