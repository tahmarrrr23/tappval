import type { ComponentPropsWithoutRef } from "react";

interface MonoCardProps extends ComponentPropsWithoutRef<"div"> {}

export const MonoCard = (props: MonoCardProps) => {
  const { children, className = "", ...rest } = props;

  return (
    <div
      className={`bg-white border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
