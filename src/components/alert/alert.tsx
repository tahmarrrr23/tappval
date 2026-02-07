import type { ComponentProps } from "react";

export interface AlertProps extends ComponentProps<"div"> {
  message: string;
}

export const Alert = (props: AlertProps) => {
  const { message, ...rest } = props;

  return (
    <div className="toast toast-start" {...rest}>
      <div className="alert alert-error rounded-sm border-2 border-black shadow-neo">
        <span>{message}</span>
      </div>
    </div>
  );
};
