import { HTMLAttributes } from "react";
import clsx from "clsx";

// Type alias (not an empty interface) so it can later gain Card-specific props.
export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
