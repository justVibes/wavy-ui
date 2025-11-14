import { BasicColor, BasicDiv, resolveBasicColor } from "@/main";
import { useState } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { BasicDivProps } from "../html/div/BasicDiv";

interface CheckboxProps {
  defaultChecked?: boolean;
  size?: BasicDivProps["size"];
  /**@default "sm" */
  corners?: BasicDivProps["corners"];
  /**@default "sm" */
  padding?: BasicDivProps["padding"];
  /**The background color of the checkbox when it is checked
   * @default "primaryContainer" */
  accentColor?: BasicColor;
  /**@default "onSurface[0.1]" */
  borderColor?: BasicColor;
  /**@default "onPrimaryContainer" */
  iconColor?: BasicColor;
  iconSize?: `${number}${"rem" | "em" | "px"}`;
  onChange?: (checked: boolean) => void;
}

function Checkbox(props: CheckboxProps) {
  const [checked, setChecked] = useState(props.defaultChecked ?? false);

  const toggleChecked = () => {
    props.onChange?.(!checked);
    setChecked(!checked);
  };
  return (
    <BasicDiv
      clickable
      size={props.size}
      corners={props.corners ?? "sm"}
      padding={props.padding ?? "sm"}
      backgroundColor={
        checked ? props.accentColor || "primaryContainer" : "transparent"
      }
      color={props.iconColor || "onPrimaryContainer"}
      borderColor={props.borderColor || "onSurface[0.1]"}
      style={{
        boxShadow: "rgba(0, 0, 0, 0.25) 0px 2px 4px 0px inset",
      }}
      onClick={toggleChecked}
    >
      <IoMdCheckmark
        size={props.iconSize}
        style={{ opacity: checked ? 1 : 0 }}
      />
    </BasicDiv>
  );
}

export default Checkbox;
