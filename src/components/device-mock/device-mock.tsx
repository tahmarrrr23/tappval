import type { ComponentPropsWithoutRef } from "react";

interface DeviceMockProps extends ComponentPropsWithoutRef<"div"> {}

export const DeviceMock = (props: DeviceMockProps) => {
  const { className, children, ...rest } = props;

  return (
    <div className={`w-[390px] h-[844px] bg-gray-50 ${className}`} {...rest}>
      {children}
    </div>
  );
};
