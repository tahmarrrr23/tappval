import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {}

export const Card = (props: CardProps) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={cn(
        "rounded-md",
        "border",
        "border-base-300",
        "bg-base-100",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
