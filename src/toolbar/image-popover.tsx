import type * as React from "react";
import { ImageIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";

export interface ImagePopoverProps {
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  imageUrl: string;
  placeholder?: string;
  onImageFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUrlChange: (value: string) => void;
  onInsertImage: () => void;
}

export function ImagePopover({
  fileInputRef,
  imageUrl,
  placeholder,
  onImageFileChange,
  onImageUrlChange,
  onInsertImage,
}: ImagePopoverProps) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              aria-label="Image"
              onMouseDown={(event) => event.preventDefault()}
            >
              <ImageIcon />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Image</TooltipContent>
      </Tooltip>
      <PopoverContent className="rt-image-popover">
        <Input
          value={imageUrl}
          onChange={(event) => onImageUrlChange(event.target.value)}
          placeholder={placeholder ?? "Image URL"}
        />
        <Button size="sm" variant="default" onClick={onInsertImage}>
          Insert
        </Button>
        {fileInputRef && onImageFileChange && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload
          </Button>
        )}
      </PopoverContent>
      {fileInputRef && onImageFileChange && (
        <Input
          ref={fileInputRef}
          className="rt-file-input"
          type="file"
          accept="image/*"
          onChange={onImageFileChange}
        />
      )}
    </Popover>
  );
}
