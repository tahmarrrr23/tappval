import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/libs/cn";

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
      <div className="alert alert-error shadow-lg">
        <span>{message}</span>
      </div>
    </div>
  );
};
