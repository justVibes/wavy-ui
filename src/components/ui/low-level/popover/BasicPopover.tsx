import React, { useEffect, useRef, type JSX } from "react";
import { v4 } from "uuid";
import {
  applyBasicStyle,
  getScrollParent,
  useManagedRef,
  useRerender,
} from "@/main";
import "./assets/styles.css";
import { BasicDivProps } from "../html/div/BasicDiv";
import { BasicColor, HtmlElementDim } from "../html/BasicStyle";
import { BasicPopoverContext } from "@/components/contexts/BasicPopoverContext";

type VerticalPlacement = "top" | "center" | "bottom";
type HorizontalPlacement = "left" | "center" | "right";
type FloaterWidth = BasicDivProps["width"] | "match-anchor";

interface BasicPopoverProps
  extends Partial<
    Record<`${"min" | "max"}Width`, FloaterWidth> &
      Record<`${"min" | "max"}Height` | "height", BasicDivProps["height"]>
  > {
  asChild?: boolean;
  children: JSX.Element;
  /** @description Wraps the child with a div. This is useful if the child can't hold a ref.
   * @remarks You can access the div's props in `slotProps.divWrapper`.
   * @default false
   */
  wrap?: boolean;
  defaultOpen?: boolean;
  /**The delay between opening and closing the popover in milliseconds
   * @default 200 */
  delay?: number | Record<"open" | "close", number>;
  /**@default "click" */
  displayAction?: "click" | "hover";
  visibleOnScroll?: boolean;
  rerenderOnClose?: boolean;
  /**@description This ensures that the popover isn't closed during interactions
   * (e.g: hovering or clicking the popover).
   * @default false
   */
  allowInteractions?: boolean;
  /**@description The point used to calculate the placement of the popover.
   * @notes
   * - If the placement is set
   * to <"top" | "right" | "bottom" | "left"> the anchorPoint is useless.
   * - While positioning, think along the lines of: "I'm placing the <"anchor-point"> of the popover
   * at the <"placement"> of the target (the child element)".
   * @default "top-left"
   */
  anchorPoint?: `${Exclude<VerticalPlacement, "center">}-${Exclude<
    HorizontalPlacement,
    "center"
  >}`;
  /**The placement of the popover's anchor point relative to the target (the child element)
   * @default "bottom-left"
   */
  placement?:
    | VerticalPlacement
    | HorizontalPlacement
    | Exclude<`${VerticalPlacement}-${HorizontalPlacement}`, "center-center">;
  insetArea?: VerticalPlacement | HorizontalPlacement;
  positionFallbacks?: string;
  /**The popover content */
  content: React.ReactNode;

  /**The distance between the popover and the target (child element).
   * @note Using a `number` is the same as `<"number">px`
   * @default ".25rem"
   */
  offset?: `${number}${"rem" | "px" | "em"}` | number;
  backdropBlur?: string;
  /**@default "onSurface" */
  color?: BasicColor;
  /**@default "onSurface[0.1]" */
  borderColor?: BasicColor;
  /**@default "surfaceContainer" */
  backgroundColor?: BasicColor;
  /**@default "max-content" */
  width?: FloaterWidth;
  /**@default "md" */
  padding?: BasicDivProps["padding"];
  /**@default "md" */
  corners?: BasicDivProps["corners"];
  /**@default "auto" */
  spill?: BasicDivProps["spill"];
  onOpenChange?: (open: boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
  slotProps?: Partial<{
    divWrapper?: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >;
  }>;
}
function BasicPopover(props: BasicPopoverProps) {
  const openedRef = useManagedRef(props.defaultOpen ?? false);
  const { triggerRerender } = useRerender();
  const popoverId = `--${v4()}`;
  const popoverRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLElement>(null);
  const ClonedChild = React.cloneElement(
    props.wrap ? (
      <div {...props.slotProps?.divWrapper}>{props.children}</div>
    ) : (
      props.children
    ),
    {
      ref: childRef,
      popoverTarget: popoverId,
    }
  );

  if (props.asChild) return props.children;

  // Assign the styles
  useEffect(() => {
    const placement = props.placement || "bottom-left",
      placementIsPositionArea = ["top", "right", "bottom", "left"].includes(
        placement
      ),
      popoverPosition = placementIsPositionArea
        ? { positionArea: placement }
        : calcAnchorPoint(
            props.anchorPoint || "top-left",
            calcPlacement(placement)
          );

    if (!props.visibleOnScroll) {
      const scrollParent = getScrollParent(popoverRef.current);
      if (scrollParent) {
        scrollParent.addEventListener("scroll", (e) => {
          popoverRef.current?.hidePopover();
          Object.assign(popoverRef.current?.style!, {
            transform: `translateX(-${
              (e.target as HTMLDivElement)?.scrollLeft
            }px)`,
          });
        });
      }
    }

    Object.assign(childRef.current?.style!, { anchorName: popoverId });

    const offsetSide = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[placement.split("-")[0]];


    Object.assign(popoverRef.current?.style!, {
      position: "absolute",
      positionAnchor: popoverId,
      insetArea: props.insetArea,
      overflow: "hidden",
      [`margin-${offsetSide}`]: props.offset ?? ".25rem",
      ...popoverPosition,
      ...(props.positionFallbacks
        ? {
            positionTryFallbacks: props.positionFallbacks,
          }
        : {}),
      ...applyBasicStyle({
        //Dimensions
        minHeight: props.minHeight,
        maxHeight: props.maxHeight,
        height: props.height,
        minWidth: calcWidth(props.minWidth),
        maxWidth: calcWidth(props.maxWidth),
        width: calcWidth(props.width, "max-content"),
        //Colors
        backgroundColor: props.backgroundColor || "surfaceContainer",
        color: props.color || "onSurface",
        borderColor: props.borderColor || "onSurface[0.1]",
        //Spacing
        padding: props.padding ?? "md",
        //Shape
        corners: props.corners ?? "md",
        //Effects
        spill: props.spill || "auto",
        backdropBlur: props.backdropBlur,
        style: { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" },
      }),
    });
  }, []);

  useEffect(() => {
    if (props.defaultOpen) {
      popoverRef.current?.showPopover();
    }
    const displayAction = props.displayAction || "click";

    // Handle rerenders
    popoverRef.current?.addEventListener("beforetoggle", (e) => {
      const isOpen = e.newState === "open";

      if (isOpen) props.onOpen?.();
      else props.onClose?.();
      props.onOpenChange?.(isOpen);

      openedRef.upsert(isOpen);
      if (!isOpen && props.rerenderOnClose) triggerRerender();
    });

    // Handle displaying the popover
    if (displayAction === "click") {
      childRef.current?.addEventListener("click", () => {
        delay(() => popoverRef.current?.togglePopover());
      });
    } else {
      let hidePopoverTimeout: NodeJS.Timeout;
      const gracePeriodInMillis = 20;

      const hidePopover = () => {
        if (hidePopoverTimeout) hidePopoverTimeout = null;
        delay(() => popoverRef.current?.hidePopover(), "close");
      };

      childRef.current?.addEventListener("mouseover", () => {
        delay(() => popoverRef.current?.showPopover(), "open");
      });
      childRef.current?.addEventListener("mouseleave", () => {
        if (props.allowInteractions) {
          hidePopoverTimeout = setTimeout(hidePopover, gracePeriodInMillis);
        } else {
          hidePopover();
        }
      });

      if (props.allowInteractions) {
        popoverRef.current?.addEventListener("mouseenter", () => {
          if (hidePopoverTimeout) clearTimeout(hidePopoverTimeout);
        });
        popoverRef.current?.addEventListener("mouseleave", hidePopover);
      }
    }
  }, []);

  const calcWidth = (
    width: FloaterWidth,
    defaults?: BasicDivProps["width"]
  ) => {
    if (width === "match-anchor")
      return getComputedStyle(childRef.current)?.width as HtmlElementDim;
    return width ?? defaults;
  };
  const delay = (callback: () => void, value?: "open" | "close") => {
    let delayInMs = 200;

    if (typeof props.delay === "number") {
      delayInMs = props.delay as number;
    } else if (props.delay && value in props.delay) {
      delayInMs = props.delay[value];
    }
    setTimeout(callback, delayInMs);
  };
  return (
    <BasicPopoverContext.Provider
      value={{
        open: () => {
          popoverRef.current?.showPopover();
        },
        close: () => {
          popoverRef.current?.hidePopover();
        },
        isOpen: () => openedRef.read(),
      }}
    >
      {ClonedChild}
      <div
        popover="auto"
        id={popoverId}
        ref={popoverRef}
        className="popover-transition"
      >
        {props.content}
      </div>
    </BasicPopoverContext.Provider>
  );
}

const calcPlacement = (placement: BasicPopoverProps["placement"]) => {
  let { 0: vertPos, 1: horizPos } = placement?.split("-")!;
  horizPos =
    horizPos === "left"
      ? "start"
      : horizPos === "right"
      ? "end"
      : horizPos ?? vertPos;
  return { vertical: `anchor(${vertPos})`, horizontal: `anchor(${horizPos})` };
};

const calcAnchorPoint = (
  anchorPoint: BasicPopoverProps["anchorPoint"],
  placements: ReturnType<typeof calcPlacement>
) => {
  const { 0: vertPoint, 1: horizPoint } = anchorPoint?.split("-")!;
  return {
    [vertPoint]: placements.vertical,
    [horizPoint]: placements.horizontal,
  };
};

export default BasicPopover;
export type { BasicPopoverProps };
