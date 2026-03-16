import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {}

export const Card = (props: CardProps) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={cn(
        "border-2",
        "border-black",
        "bg-base-100",
        "shadow-neo",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
