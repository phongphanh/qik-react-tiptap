import type { Editor } from "@tiptap/core";
import { ChevronDown, Table } from "lucide-react";
import * as React from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const COLS = 10;
const ROWS = 10;

export function TableInsertPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState({ cols: 0, rows: 0 });

  const handleSelect = () => {
    if (hovered.rows === 0 || hovered.cols === 0) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: hovered.rows, cols: hovered.cols, withHeaderRow: true })
      .run();
    setOpen(false);
    setHovered({ cols: 0, rows: 0 });
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setHovered({ cols: 0, rows: 0 });
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              aria-label="Insert table"
              className="rt-dropdown-tool-trigger"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Table />
              <ChevronDown className="rt-trigger-chevron" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Insert table</TooltipContent>
      </Tooltip>

      <PopoverContent className="rt-table-grid-popover" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div
          className="rt-table-grid"
          onMouseLeave={() => setHovered({ cols: 0, rows: 0 })}
        >
          {Array.from({ length: ROWS }, (_, row) => (
            <div key={row} className="rt-table-grid-row">
              {Array.from({ length: COLS }, (_, col) => (
                <button
                  key={col}
                  type="button"
                  className="rt-table-grid-cell"
                  data-active={row < hovered.rows && col < hovered.cols ? "" : undefined}
                  onMouseEnter={() => setHovered({ cols: col + 1, rows: row + 1 })}
                  onClick={handleSelect}
                  aria-label={`${row + 1} × ${col + 1} table`}
                />
              ))}
            </div>
          ))}
        </div>

        <p className="rt-table-grid-label">
          {hovered.rows > 0 && hovered.cols > 0
            ? `${hovered.rows} × ${hovered.cols}`
            : "Insert table"}
        </p>
      </PopoverContent>
    </Popover>
  );
}
