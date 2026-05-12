import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva("rt-button", {
  variants: {
    variant: {
      default: "rt-button-default",
      ghost: "rt-button-ghost",
      outline: "rt-button-outline",
    },
    size: {
      sm: "rt-button-sm",
      md: "rt-button-md",
      icon: "rt-button-icon",
    },
    active: {
      true: "rt-button-active",
      false: "",
    },
  },
  defaultVariants: {
    variant: "ghost",
    size: "icon",
    active: false,
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, active, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, active }), className)}
      aria-pressed={active ?? undefined}
      {...props}
    />
  ),
);

Button.displayName = "Button";
