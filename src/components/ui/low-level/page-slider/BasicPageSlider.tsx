import React, { useCallback, useEffect, useState } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { hasIndex } from "@wavy/fn";
import { BasicButton, BasicDiv } from "@/main";
import { IconType } from "react-icons";
import usePageSliderController, {
  UsePageSliderControllerReturn,
} from "@/components/hooks/usePageSliderController";

// const max_visibility = 3;

interface BasicPageSliderProps {
  controller?: UsePageSliderControllerReturn;
  children: ((props: { isActive: boolean }) => React.ReactElement)[];
  navButtonSize?: string;
  onChange?: (pageIdx: number) => void;
}
function BasicPageSlider(props: BasicPageSliderProps) {
  // const [allowManualNavigate, setAllowManualNavigate] = useState(false);
  const controller = props.controller || usePageSliderController(0);
  const [activePage, setActivePage] = useState(controller.defaultPage ?? 0);
  // setActivePage(controller.defaultPage ?? 0);

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

  // useEffect(() => {
  //   setActivePage(controller)
  // },[])
  // useEffect(() => {
  //   if(props.controller){
  //     props.controller.
  //   }
  // },[activePage])

  // useEffect(() => {
  //   if (
  //     activePage !== props.defaultActivePageIdx &&
  //     props.defaultActivePageIdx !== undefined &&
  //     !allowManualNavigate
  //   ) {
  //     if (activePage === props.defaultActivePageIdx)
  //       setAllowManualNavigate(true);
  //     setTimeout(() => {
  //       if (activePage === props.defaultActivePageIdx) return;
  //       const nextPage =
  //         activePage < props.defaultActivePageIdx!
  //           ? activePage + 1
  //           : activePage - 1;
  //       setActivePage(nextPage);
  //     }, 100);
  //   }
  // }, [props.defaultActivePageIdx, activePage]);

  // const handleSetActivePage = (page: number) => {
  //   if (props.children[page] === undefined) return;
  //   if (props.activePage === undefined) setActivePage(page);
  //   if (!allowManualNavigate) setAllowManualNavigate(true);
  //   props.onChange?.(page);
  // };

  const handleOnPrevClick = () => controller.goTo(activePage - 1);
  const handleOnNextClick = () => controller.goTo(activePage + 1);

  return (
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
        const CSS_VARS = {
          direction: Math.sign(activePage - idx),
          absOffset: Math.abs(activePage - idx) / 3,
        };
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              overflow: "hidden",
              transition: "all 0.3s ease-out",
              flexGrow: 1,
              display: Math.abs(activePage - idx) > 2 ? "none" : "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: `
                scaleY(calc(1 + ${CSS_VARS.absOffset} * -0.4))
                translateZ(calc(${CSS_VARS.absOffset} * -10rem))
                translateX(calc(${CSS_VARS.direction} * -5rem))`,
              filter: `
              blur(calc(${CSS_VARS.absOffset} * .5rem))
              `,
              boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
            }}
          >
            {<Child isActive={idx === activePage} />}
          </div>
        );
      })}
      <Nav
        inset="right"
        disabled={!hasIndex(props.children, activePage + 1)}
        onClick={handleOnNextClick}
      />
    </div>
  );
}

function Nav(props: {
  disabled: boolean;
  inset: "left" | "right";
  onClick?: () => void;
}) {
  const Icon = props.inset === "left" ? BsArrowLeft : BsArrowRight;
  return (
    <BasicDiv
      fade={props.disabled ? 0.5 : 1}
      cursor={props.disabled ? "not-allowed" : "pointer"}
      pos="absolute"
      centerSelf={"y"}
      centerContent
      padding={"md"}
      backgroundColor="onSurface"
      color="surface"
      corners={"circle"}
      sx={{
        [props.inset as any]: "1rem",
        zIndex: 2,
        transition: "all 0.3s ease-in-out",
        boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
        ":hover > *": {
          animation: "squish 300ms ease-in-out",
        },
        ":active": {
          scale: 0.9,
          opacity: 0.75,
        },
      }}
      onClick={props.disabled ? undefined : props.onClick}
    >
      <Icon />
    </BasicDiv>
  );
}

export default BasicPageSlider;
