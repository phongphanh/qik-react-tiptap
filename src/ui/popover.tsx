import * as React from "react";
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { cn } from "../lib/utils";
import { getThemeAttribute, useEditorTheme } from "../theme";

interface PopoverCtx {
  open: boolean;
  setOpen: (open: boolean) => void;
  refs: ReturnType<typeof useFloating>["refs"];
  floatingStyles: React.CSSProperties;
  context: ReturnType<typeof useFloating>["context"];
  getReferenceProps: (props?: Record<string, unknown>) => Record<string, unknown>;
  getFloatingProps: (props?: Record<string, unknown>) => Record<string, unknown>;
}

const Ctx = React.createContext<PopoverCtx | null>(null);

export function Popover({
  open: controlledOpen,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: handleOpenChange,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "dialog" });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <Ctx.Provider
      value={{
        open,
        setOpen: handleOpenChange,
        refs,
        floatingStyles,
        context,
        getReferenceProps: getReferenceProps as (props?: Record<string, unknown>) => Record<string, unknown>,
        getFloatingProps: getFloatingProps as (props?: Record<string, unknown>) => Record<string, unknown>,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function PopoverTrigger({
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
      ref: ctx.refs.setReference,
    });
  }

  return (
    <button
      ref={ctx.refs.setReference as React.LegacyRef<HTMLButtonElement>}
      {...(refProps as React.HTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

export function PopoverContent({
  className,
  align: _align,
  sideOffset: _sideOffset,
  onOpenAutoFocus,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: string;
  sideOffset?: number;
  onOpenAutoFocus?: (event: Event) => void;
}) {
  const ctx = React.useContext(Ctx)!;
  const theme = useEditorTheme();

  if (!ctx.open) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager
        context={ctx.context}
        modal={false}
        initialFocus={onOpenAutoFocus ? -1 : 0}
      >
        <div
          ref={ctx.refs.setFloating as React.LegacyRef<HTMLDivElement>}
          style={ctx.floatingStyles}
          data-rt-theme={getThemeAttribute(theme)}
          className={cn("rt-popover-content", className)}
          {...(ctx.getFloatingProps(props as Record<string, unknown>) as React.HTMLAttributes<HTMLDivElement>)}
        >
          {children}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}

export function PopoverClose({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(Ctx)!;

  return (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        ctx.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
