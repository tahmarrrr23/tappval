import type { ComponentPropsWithoutRef } from "react";

export interface FooterProps extends ComponentPropsWithoutRef<"footer"> {}

export const Footer = (props: FooterProps) => {
  const { className = "", ...rest } = props;

  return (
    <footer
      className={`w-full max-w-6xl border-t-2 border-gray-200 pt-8 ${className}`}
      {...rest}
    >
      <p className="text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Fumiya Yamashita. All rights reserved.
      </p>
    </footer>
  );
};
