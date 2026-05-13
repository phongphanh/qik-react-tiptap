import * as React from "react";
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { cn } from "../lib/utils";
import { getThemeAttribute, useEditorTheme } from "../theme";

const DelayCtx = React.createContext(700);

export function TooltipProvider({
  delayDuration = 700,
  children,
}: {
  delayDuration?: number;
  children: React.ReactNode;
}) {
  return <DelayCtx.Provider value={delayDuration}>{children}</DelayCtx.Provider>;
}

interface TooltipCtx {
  open: boolean;
  setReference: (node: Element | null) => void;
  setFloating: (node: HTMLElement | null) => void;
  floatingStyles: React.CSSProperties;
  getReferenceProps: (props?: React.HTMLAttributes<Element>) => Record<string, unknown>;
  getFloatingProps: (props?: React.HTMLAttributes<HTMLElement>) => Record<string, unknown>;
}

const Ctx = React.createContext<TooltipCtx | null>(null);

export function Tooltip({ children }: { children: React.ReactNode }) {
  const delay = React.useContext(DelayCtx);
  const [open, setOpen] = React.useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const hover = useHover(context, { delay: { open: delay, close: 0 }, move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <Ctx.Provider
      value={{
        open,
        setReference: refs.setReference as (node: Element | null) => void,
        setFloating: refs.setFloating,
        floatingStyles,
        getReferenceProps: getReferenceProps as (props?: React.HTMLAttributes<Element>) => Record<string, unknown>,
        getFloatingProps: getFloatingProps as (props?: React.HTMLAttributes<HTMLElement>) => Record<string, unknown>,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function TooltipTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactElement;
}) {
  const ctx = React.useContext(Ctx)!;
  const refProps = ctx.getReferenceProps();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      ...refProps,
      ref: ctx.setReference,
    });
  }

  return (
    <span
      ref={ctx.setReference as React.LegacyRef<HTMLSpanElement>}
      {...(refProps as React.HTMLAttributes<HTMLSpanElement>)}
    >
      {children}
    </span>
  );
}

export function TooltipContent({
  className,
  sideOffset: _sideOffset,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }) {
  const ctx = React.useContext(Ctx)!;
  const theme = useEditorTheme();

  if (!ctx.open) return null;

  return (
    <FloatingPortal>
      <div
        ref={ctx.setFloating as React.LegacyRef<HTMLDivElement>}
        style={ctx.floatingStyles}
        data-rt-theme={getThemeAttribute(theme)}
        className={cn("rt-tooltip-content", className)}
        {...(ctx.getFloatingProps(props as React.HTMLAttributes<HTMLElement>) as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    </FloatingPortal>
  );
}
