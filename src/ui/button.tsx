import * as React from "react";
import { cn } from "../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "icon";
  active?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "ghost", size = "icon", active = false, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "rt-button",
        variant === "ghost" && "rt-button-ghost",
        variant === "default" && "rt-button-default",
        variant === "outline" && "rt-button-outline",
        size === "sm" && "rt-button-sm",
        size === "md" && "rt-button-md",
        size === "icon" && "rt-button-icon",
        active && "rt-button-active",
        className,
      )}
      aria-pressed={active || undefined}
      {...props}
    />
  ),
);

Button.displayName = "Button";
