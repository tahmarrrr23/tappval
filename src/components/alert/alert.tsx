import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/libs/cn";

export interface AlertProps extends ComponentPropsWithoutRef<"div"> {
  message: string;
}

export const Alert = (props: AlertProps) => {
  const { message, className, ...rest } = props;

  return (
    <div
      className={cn(
        "toast",
        "toast-start",
        "rounded-sm",
        "border-2",
        "border-black",
        "shadow-neo",
        className,
      )}
      {...rest}
    >
      <div className={cn("alert alert-error", className)}>
        <span>{message}</span>
      </div>
    </div>
  );
};
