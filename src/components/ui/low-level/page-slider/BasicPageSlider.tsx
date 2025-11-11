import usePageSliderController, {
  UsePageSliderControllerReturn,
} from "@/components/hooks/usePageSliderController";
import { BasicColor, BasicDiv } from "@/main";
import { hasIndex } from "@wavy/fn";
import { SafeOmit } from "@wavy/types";
import React, { createContext, useCallback, useContext, useState } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { BasicDivProps } from "../html/div/BasicDiv";

const Context =
  createContext<
    SafeOmit<BasicPageSliderProps, "children" | "controller" | "onChange">
  >(null);

interface BasicPageSliderProps {
  controller?: UsePageSliderControllerReturn;
  children:
    | ((props: { isActive: boolean }) => React.ReactElement)[]
    | React.ReactElement[];
  navSize?: BasicDivProps["size"];
  navIconSize?: `${number}${"rem" | "px" | "em"}`;
  /**@default "md" */
  navPadding?: BasicDivProps["padding"];
  /**@default "surface" */
  navIconColor?: BasicColor;
  /**@default "onSurface" */
  navBackgroundColor?: BasicColor;
  /**@default "circle" */
  navCorners?: BasicDivProps["corners"];
  onChange?: (pageIdx: number) => void;
}
function BasicPageSlider(props: BasicPageSliderProps) {
  const controller = props.controller || usePageSliderController(0);
  const [activePage, setActivePage] = useState(controller.defaultPage ?? 0);

  controller.goTo = useCallback(
    (page) => {
      if (page === activePage) return;
      props.onChange?.(page);
      setActivePage(page);
    },
    [activePage]
  );
  controller.isActive = useCallback(
    (page) => page === activePage,
    [activePage]
  );

  const handleOnPrevClick = () => controller.goTo(activePage - 1);
  const handleOnNextClick = () => controller.goTo(activePage + 1);

  return (
    <Context.Provider value={{ ...props }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          transition: "all 300ms ease-in-out",
          gap: ".5rem",
          perspective: "500px",
          transformStyle: "preserve-3d",
          alignItems: "center",
          justifyContent: "center",
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
                flexGrow: 1,
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

export default BasicPageSlider;
