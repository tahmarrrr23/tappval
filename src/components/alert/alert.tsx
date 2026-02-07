import type { ComponentProps } from "react";

export interface AlertProps extends ComponentProps<"div"> {
  message: string;
}

export const Alert = (props: AlertProps) => {
  const { message, ...rest } = props;

  return (
    <div className="toast toast-start" {...rest}>
      <div className="alert alert-error rounded-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span>{message}</span>
      </div>
    </div>
  );
};
