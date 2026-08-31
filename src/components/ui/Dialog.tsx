import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const DialogRoot = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

/**
 * Radix renders nothing here when its root is `modal={false}` — which is also where the scroll
 * lock lives, so a non-modal panel leaves the page behind it live and scrollable.
 */
const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/30",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200 motion-reduce:animate-none",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const panelClass =
  "flex flex-col bg-white outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-200 motion-reduce:animate-none";

/** Undoes the drawer's slide once the panel stops reaching for the right-hand edge. */
const noSlideClass =
  "md:data-[state=open]:slide-in-from-right-0 md:data-[state=closed]:slide-out-to-right-0";

/** Same panel look as `panelClass`, but a plain zoom in/out — no slide-in-from-right at any size. */
const modalPanelClass =
  "flex flex-col bg-white rounded-xl shadow-black outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200 motion-reduce:animate-none";

export interface DialogContentProps extends ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  /**
   * Where the panel sits from `md` up. `centered` floats it over the page in a portal; `anchored`
   * drops it out of the nearest positioned ancestor, 6px below it and matched to its width, so it
   * reads as part of the control that opened it. Below `md` both are the same right-hand drawer.
   *
   * `modal` is a centred card at every size, including mobile — no drawer, no slide. Use it for
   * dialogs that read oddly as a full-height side drawer on phones (confirmations, detail views).
   *
   * An `anchored` panel is normally paired with `modal={false}` on `DialogRoot`: it has no scrim,
   * and locking the page would strand the bottom of a tall panel below the fold.
   */
  placement?: "centered" | "anchored" | "modal";
}

/**
 * A right-hand drawer on small screens, and from `md` up either a centred dialog or a card
 * anchored under whatever opened it.
 *
 * The centred panel is placed by its flex wrapper rather than by a transform, which leaves
 * `translate` free for the enter and exit animations to use.
 */
const DialogContent = forwardRef<ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, children, placement = "centered", ...props }, ref) => {
    if (placement === "modal") {
      return (
        <DialogPrimitive.Portal>
          <DialogOverlay />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <DialogPrimitive.Content
              ref={ref}
              className={cn(
                modalPanelClass,
                "pointer-events-auto max-h-[85vh] w-full max-w-[400px]",
                className
              )}
              {...props}
            >
              {children}
            </DialogPrimitive.Content>
          </div>
        </DialogPrimitive.Portal>
      );
    }

    if (placement === "anchored") {
      return (
        <>
          <DialogOverlay />
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              panelClass,
              "fixed top-0 right-0 bottom-0 z-50 w-[300px] max-w-[85vw]",
              "md:absolute md:inset-x-0 md:top-[calc(100%+6px)] md:bottom-auto md:h-auto md:w-auto md:max-w-none md:rounded-xl md:shadow-black",
              noSlideClass,
              "md:data-[state=open]:slide-in-from-top-2 md:data-[state=closed]:slide-out-to-top-2",
              className
            )}
            {...props}
          >
            {children}
          </DialogPrimitive.Content>
        </>
      );
    }

    return (
      <DialogPrimitive.Portal>
        <DialogOverlay />
        {/* Transparent to pointers so a click beside the panel reaches the overlay and dismisses. */}
        <div className="pointer-events-none fixed inset-0 z-50 flex justify-end md:items-center md:justify-center md:p-8">
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              panelClass,
              "pointer-events-auto h-full w-[300px] max-w-[85vw]",
              "md:h-auto md:max-h-full md:w-[676px] md:max-w-full md:rounded-xl md:shadow-black",
              noSlideClass,
              "md:data-[state=open]:zoom-in-95 md:data-[state=closed]:zoom-out-95",
              className
            )}
            {...props}
          >
            {children}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "font-ibm-plex text-foreground text-lg leading-[30px] font-semibold md:text-xl md:leading-[33px]",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "font-ibm-plex text-foreground-muted text-sm leading-[23px] md:text-base md:leading-[26px]",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  DialogRoot,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
