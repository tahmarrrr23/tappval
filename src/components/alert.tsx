import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export interface AlertProps extends ComponentPropsWithoutRef<"div"> {
  message: string;
}

export const Alert = (props: AlertProps) => {
  const { message, className, ...rest } = props;

  return (
    <div
      className={cn("toast", "toast-top", "toast-end", "z-50", className)}
      {...rest}
    >
      <div className="border-2 border-black bg-error text-error-content p-4 shadow-neo font-bold text-sm">
        <span>{message}</span>
      </div>
    </div>
  );
};
