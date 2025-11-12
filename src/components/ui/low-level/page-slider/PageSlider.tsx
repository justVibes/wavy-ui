import usePageSliderController, {
  UsePageSliderControllerReturn,
} from "@/components/hooks/usePageSliderController";
import { applyBasicStyle, BasicColor, BasicDiv } from "@/main";
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

const Context =
  createContext<
    SafeOmit<
      PageSliderProps,
      | "children"
      | "controller"
      | "onChange"
      | "childFlexGrow"
      | "gap"
      | "height"
      | "width"
    >
  >(null);

interface PageSliderProps {
  controller?: UsePageSliderControllerReturn;
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
  onChange?: (pageIdx: number) => void;
}
function PageSlider(props: PageSliderProps) {
  const controller = props.controller || usePageSliderController(0);
  const [activePage, setActivePage] = useState(controller.defaultPage ?? 0);
  let onChangeCb: (page: number) => void;
  controller.goTo = useCallback(
    (page) => {
      if (page === activePage) return;
      onChangeCb?.(page);
      props.onChange?.(page);
      setActivePage(page);
    },
    [activePage]
  );
  controller.isActive = useCallback(
    (page) => page === activePage,
    [activePage]
  );
  controller.onPageChange = useCallback((cb) => {
    onChangeCb = cb;
  }, []);

  useEffect(() => {
    const cleanup = () => {
      controller.goTo = null;
      controller.isActive = null;
      controller.onPageChange = null;
      onChangeCb = null;
    };

    return cleanup;
  }, []);

  const handleOnPrevClick = () => controller.goTo(activePage - 1);
  const handleOnNextClick = () => controller.goTo(activePage + 1);

  return (
    <Context.Provider value={{ ...props }}>
      <div
        style={applyBasicStyle({
          pos: "relative",
          spill:props.spill,
          height: props.height,
          width: props.width ?? "100%",
          gap: props.gap ?? ".5rem",
          centerContent: true,
          style: {
            transition: "all 300ms ease-in-out",
            perspective: "500px",
            transformStyle: "preserve-3d",
          },
        })}
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

  return (
    <BasicDiv
      fade={props.disabled ? 0.5 : 1}
      cursor={props.disabled ? "not-allowed" : "pointer"}
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
        transition: "all 0.3s ease-in-out",
        boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
        ":hover > *": props.disabled
          ? undefined
          : {
              animation: "squish 300ms ease-in-out",
            },
        ":active": props.disabled
          ? undefined
          : {
              scale: 0.9,
              opacity: 0.75,
            },
      }}
      onClick={props.disabled ? undefined : props.onClick}
    >
      <Icon size={ctx.navIconSize} />
    </BasicDiv>
  );
}

export default PageSlider;
