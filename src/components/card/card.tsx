import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/libs/cn";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {}

export const Card = (props: CardProps) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={cn(
        "card",
        "card-border",
        "bg-base-100",
        "shadow-sm",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
