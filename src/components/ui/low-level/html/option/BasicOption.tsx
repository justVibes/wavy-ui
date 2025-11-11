import {
  applyBasicStyle,
  BasicColor,
  BasicDiv,
  BasicSpan,
  ellipsis,
  Sx,
} from "@/main";
import React from "react";
import { BasicDivProps } from "../div/BasicDiv";
import { BasicSpanProps } from "../span/BasicSpan";
import { LuCheck } from "react-icons/lu";

interface BasicOptionProps {
  value: string | number;
  selected?: boolean;
  /**@default "full" */
  width?: BasicDivProps["width"];
  /**@default "sm" */
  padding?: BasicDivProps["padding"];
  /**@default "md" */
  corners?: BasicDivProps["corners"];
  /**@default "sm" */
  fontSize?: BasicSpanProps["fontSize"];
  color?: BasicColor;
  disabled?: boolean;
  backgroundColor?: BasicColor;
  sx?: Sx;
  scrollIntoView?: boolean;
  onClick?: () => void;
}
function BasicOption(props: BasicOptionProps) {
  return (
    <BasicDiv
      row
      // 7.11.2025 @ 12:45 am (last comment)
      // For some reason scrolling into view doesn't work when initially rendered in BasicSelect...
      // Possible reasons: unknown,
      // Tried:
      //  [1] Rerendering the parent (Not the BasicSelect put the direct parent of the options)
      //      after the initial render.
      ref={(r) => {
        if (r && !props.scrollIntoView && props.selected)
          r.scrollIntoView(true);
      }}
      gap={"sm"}
      align="center"
      fade={props.disabled ? 0.5 : 1}
      width={props.width ?? "full"}
      corners={props.corners ?? "md"}
      padding={props.padding ?? "sm"}
      fontSize={props.fontSize || "sm"}
      cursor={props.disabled ? "not-allowed" : "pointer"}
      css={{
        ...props.sx,
        transition: props.sx?.transition || "all 200ms linear",
        color:
          props.color ||
          props.sx?.color ||
          (props.selected ? "surface" : "onSurface"),
        backgroundColor:
          props.backgroundColor ||
          props.sx?.backgroundColor ||
          (props.selected ? "onSurface" : undefined),
        ":hover":
          props.disabled || props.selected
            ? undefined
            : {
                ...props.sx?.[":hover"],
                backgroundColor:
                  props.sx?.[":hover"]?.backgroundColor || "onSurface[0.1]",
              },
      }}
      onClick={props.disabled ? undefined : props.onClick}
    >
      {props.selected && <LuCheck style={{ flexShrink: 0 }} />}
      <span
        // ref={(r) =>
        //   r && !props.scrollIntoView && props.selected && r.scrollIntoView()
        // }
        children={props.value.toString()}
        style={ellipsis({
          maxWidth: "100%",
          flex: "1",
          alignItems: "start",
          textAlign: "start",
        })}
      />
    </BasicDiv>
  );
}

export default BasicOption;
