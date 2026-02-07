import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/libs/cn";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {}

export const Card = (props: CardProps) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={cn(
        "bg-white",
        "border-2",
        "border-black",
        "text-black",
        "shadow-neo",
        "rounded-sm",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
