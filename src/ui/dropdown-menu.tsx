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

interface MenuCtx {
  open: boolean;
  setOpen: (open: boolean) => void;
  refs: ReturnType<typeof useFloating>["refs"];
  floatingStyles: React.CSSProperties;
  context: ReturnType<typeof useFloating>["context"];
  getReferenceProps: (props?: Record<string, unknown>) => Record<string, unknown>;
  getFloatingProps: (props?: Record<string, unknown>) => Record<string, unknown>;
}

const Ctx = React.createContext<MenuCtx | null>(null);

export function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
    if (!next) {
      requestAnimationFrame(() => {
        (refs.reference.current as HTMLElement | null)?.focus();
      });
    }
  };

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <Ctx.Provider
      value={{
        open,
        setOpen,
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

export function DropdownMenuTrigger({
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

export function DropdownMenuContent({
  className,
  align: _align,
  sideOffset: _sideOffset,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: string;
  sideOffset?: number;
}) {
  const ctx = React.useContext(Ctx)!;
  const theme = useEditorTheme();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Focus first menu item when opened
  React.useLayoutEffect(() => {
    if (ctx.open) {
      requestAnimationFrame(() => {
        const first = contentRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
        first?.focus();
      });
    }
  }, [ctx.open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!contentRef.current) return;
    const items = Array.from(
      contentRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    const idx = items.indexOf(document.activeElement as HTMLElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    }
  };

  if (!ctx.open) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager context={ctx.context} modal={false} initialFocus={-1}>
        <div
          ref={(el) => {
            (ctx.refs.setFloating as (node: HTMLElement | null) => void)(el);
            (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }}
          style={ctx.floatingStyles}
          data-rt-theme={getThemeAttribute(theme)}
          className={cn("rt-menu-content", className)}
          onKeyDown={handleKeyDown}
          {...(ctx.getFloatingProps(props as Record<string, unknown>) as React.HTMLAttributes<HTMLDivElement>)}
        >
          {children}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}

export function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <div role="group">{children}</div>;
}

export function DropdownMenuItem({
  className,
  onSelect,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onSelect?: () => void }) {
  const ctx = React.useContext(Ctx)!;

  return (
    <div
      role="menuitem"
      tabIndex={-1}
      className={cn("rt-menu-item", className)}
      onClick={() => {
        onSelect?.();
        ctx.setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
          ctx.setOpen(false);
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rt-menu-label", className)} {...props}>
      {children}
    </div>
  );
}
