import type { ComponentPropsWithoutRef } from "react";

interface CardProps extends ComponentPropsWithoutRef<"div"> {}

export const Card = (props: CardProps) => {
  const { children, className = "", ...rest } = props;

  return (
    <div
      className={`bg-white border-2 border-black text-black shadow-neo rounded-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
