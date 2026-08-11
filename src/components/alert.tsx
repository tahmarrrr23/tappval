import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export interface AlertProps extends ComponentPropsWithoutRef<"div"> {
  message: string;
}

export const Alert = (props: AlertProps) => {
  const { message, className, ...rest } = props;

  return (
    <div className={cn("toast toast-top toast-end z-50", className)} {...rest}>
      <div className="max-w-sm rounded-sm border border-error/30 bg-base-100 p-4 text-sm font-medium text-base-content">
        <span>{message}</span>
      </div>
    </div>
  );
};
