"use client";

import { X } from "lucide-react";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
} from "@/components/ui";
import type { ButtonProps } from "@/components/ui/Button";

export type ConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonProps["variant"];
  confirmColor?: ButtonProps["color"];
  cancelVariant?: ButtonProps["variant"];
  cancelColor?: ButtonProps["color"];
  isLoading?: boolean;
  onConfirm: () => void;
};

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  confirmVariant = "default",
  confirmColor = "destructive",
  cancelVariant = "outline",
  cancelColor = "destructive",
  isLoading = false,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent placement="modal" className="w-[520px] max-w-[520px] gap-4 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle>{title}</DialogTitle>
            <DialogClose
              aria-label="ปิด"
              className="text-placeholder hover:text-foreground focus-visible:ring-primary shrink-0 cursor-pointer rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <X aria-hidden="true" className="size-5" />
            </DialogClose>
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </div>

        <div className="flex w-full justify-end gap-3">
          <Button
            type="button"
            variant={cancelVariant}
            color={cancelColor}
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            color={confirmColor}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
