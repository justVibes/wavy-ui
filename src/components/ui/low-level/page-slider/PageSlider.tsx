import usePageSliderController, {
  UsePageSliderControllerReturn,
} from "@/components/hooks/usePageSliderController";
import { applyBasicStyle, BasicColor, BasicDiv, useManagedRef } from "@/main";
import { hasIndex } from "@wavy/fn";
import { SafeOmit } from "@wavy/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { BasicDivProps } from "../html/div/BasicDiv";

const Context = createContext<
  SafeOmit<
    PageSliderProps<any>,
    | "children"
    | "controller"
    | "onChange"
    | "childFlexGrow"
    | "gap"
    | "height"
    | "width"
  > & { transitioning: boolean }
>(null);

interface PageSliderProps<T> {
  controller?: UsePageSliderControllerReturn<T>;
  spill?: BasicDivProps["spill"];
  /**@default "md" */
  gap?: BasicDivProps["gap"];
  height?: BasicDivProps["height"];
  /**@default "100%" */
  width?: BasicDivProps["width"];
  children:
    | ((props: { isActive: boolean }) => React.ReactElement)[]
    | React.ReactElement[];
  navSize?: BasicDivProps["size"];
  navBorderColor?: BasicColor;
  navIconSize?: `${number}${"rem" | "px" | "em"}`;
  /**@default "md" */
  navPadding?: BasicDivProps["padding"];
  /**@default "surface" */
  navIconColor?: BasicColor;
  /**@default "onSurface" */
  navBackgroundColor?: BasicColor;
  /**@default "circle" */
  navCorners?: BasicDivProps["corners"];
  /**@default 1 */
  childFlexGrow?: number;
  onEcho?: (message?: string) => T;
  onChange?: (from: number, to: number) => void;
}
function PageSlider<T>(props: PageSliderProps<T>) {
  const [transitioning, setTransitioning] = useState(false);
  const controller = props.controller || usePageSliderController(0);
  const [activePage, setActivePage] = useState(controller.defaultPage ?? 0);

  let onChangeCb: (from: number, to: number) => void;
  controller.goTo = useCallback(
    (to, options) => {
      const transition = options?.transition || "smooth";
      const from = activePage;

      if (
        to === from ||
        (!options?.ignoreOutOfBoundsCheck && !props.children[to])
      )
        return;
      // if() return
      onChangeCb?.(from, to);
      props.onChange?.(from, to);

      if (Math.abs(from - to) > 1 && transition === "smooth") {
        setTransitioning(true);
        let counter = from;
        const interval = setInterval(() => {
          if (to > from) counter++;
          else counter--;

          setActivePage(counter);

          // If this is the last iteration
          if (counter === to) {
            clearInterval(interval);
            setTransitioning(false);
          }
        }, options?.transitionDuration || 200);
      } else {
        setActivePage(to);
      }
    },
    [activePage, props.children]
  );
  // useCallback stops the function from rerendering when deps that are generated outside
  // of this component changes.
  // Untried fixes: Add deps to the onEcho callback
  controller.echo = props.onEcho;
  controller.isPageActive = useCallback(
    (page) => page === activePage,
    [activePage]
  );
  controller.onPageChange = useCallback((cb) => {
    onChangeCb = cb;
  }, []);
  controller.getActivePage = useCallback(() => activePage, [activePage]);

  useEffect(() => {
    const cleanup = () => {
      for (const key of Object.keys(controller)) {
        const validKey = key as keyof typeof controller;

        if (typeof controller[validKey] === "function") {
          controller[validKey] = null;
        }
      }
      onChangeCb = null;
    };

    return cleanup;
  }, []);

  const handleOnPrevClick = () => controller.goTo(activePage - 1);
  const handleOnNextClick = () => controller.goTo(activePage + 1);

  const parentStyle = applyBasicStyle({
    height: props.height,
    width: props.width,
    spill: props.spill,
    gap: props.gap,
  });

  return (
    <Context.Provider value={{ ...props, transitioning }}>
      <div
        // 12.11.2025 @ 8:25 am
        // Using applyBasicStyle breaks the components positioning
        style={{
          display: "flex",
          position: "relative",
          alignItems: "center",
          height: parentStyle.height,
          width: parentStyle.width ?? "100%",
          justifyContent: "center",
          gap: parentStyle.gap ?? ".5rem",
          overflow: parentStyle.overflow,
          transition: "all 300ms ease-in-out",
          perspective: "500px",
          transformStyle: "preserve-3d",
        }}
      >
        <Nav
          disabled={activePage <= 0}
          inset="left"
          onClick={handleOnPrevClick}
        />

        {props.children.map((Child, idx) => {
          const direction = Math.sign(activePage - idx),
            absOffset = Math.abs(activePage - idx) / 3;
          const outOfView = Math.abs(activePage - idx) > 2;

          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                overflow: "hidden",
                transition: "all 0.3s ease-out",
                flexGrow: props.childFlexGrow ?? 1,
                display: outOfView ? "none" : "flex",
                justifyContent: "center",
                alignItems: "center",
                transform: `
                scaleY(calc(1 + ${absOffset} * -0.4))
                translateZ(calc(${absOffset} * -10rem))
                translateX(calc(${direction} * -5rem))`,
                filter: `blur(calc(${absOffset} * .5rem))`,
                boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
              }}
            >
              {typeof Child === "function" ? (
                <Child isActive={idx === activePage} />
              ) : (
                Child
              )}
            </div>
          );
        })}
        <Nav
          inset="right"
          disabled={!hasIndex(props.children, activePage + 1)}
          onClick={handleOnNextClick}
        />
      </div>
    </Context.Provider>
  );
}

function Nav(props: {
  disabled: boolean;
  inset: "left" | "right";
  onClick?: () => void;
}) {
  const ctx = useContext(Context);
  const Icon = props.inset === "left" ? BsArrowLeft : BsArrowRight;
  const disabled = props.disabled || ctx.transitioning;

  return (
    <BasicDiv
      fade={disabled ? 0.5 : 1}
      cursor={disabled ? "not-allowed" : "pointer"}
      pos="absolute"
      centerSelf={"y"}
      centerContent
      borderColor={ctx.navBorderColor}
      padding={ctx.navPadding ?? "md"}
      backgroundColor={ctx.navBackgroundColor || "onSurface"}
      color={ctx.navIconColor || "surface"}
      corners={ctx.navCorners ?? "circle"}
      size={ctx.navSize}
      css={{
        [props.inset as any]: "1rem",
        zIndex: 2,
        transition: "all 300ms ease-in-out",
        boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
        ":hover > *": disabled
          ? undefined
          : {
              animation: "squish 300ms ease-in-out",
            },
        ":active": disabled
          ? undefined
          : {
              scale: 0.9,
              opacity: 0.75,
            },
      }}
      onClick={disabled ? undefined : props.onClick}
    >
      <Icon size={ctx.navIconSize} />
    </BasicDiv>
  );
}

export default PageSlider;
