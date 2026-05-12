export function isToolbarInteractionTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        [
          ".rt-floating-toolbar",
          ".rt-link-toolbar",
          ".rt-image-toolbar",
          ".rt-table-toolbar",
          ".rt-menu-content",
          ".rt-popover-content",
          ".rt-tooltip-content",
        ].join(", "),
      ),
    )
  );
}
