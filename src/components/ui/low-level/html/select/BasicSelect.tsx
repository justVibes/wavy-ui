import { JSX } from "@emotion/react/jsx-runtime";
import { SafeOmit } from "@wavy/types";
import BasicDiv, { BasicDivProps } from "../div/BasicDiv";
import { createContext, useContext, useEffect, useState } from "react";
import BasicOption from "../option/BasicOption";
import { BasicPopover, usePopoverContext, useRerender } from "@/main";
import { BasicPopoverProps } from "../../popover/BasicPopover";

const Context =
  createContext<
    Pick<
      BasicSelectProps<unknown>,
      "gap" | "options" | "onOptionClick" | "isSelected"
    >
  >(null);

interface BasicSelectProps<T>
  extends SafeOmit<
    BasicPopoverProps,
    "displayAction" | "content" | "placement" | "allowInteractions"
  > {
  isSelected?: (option: BasicSelectProps<T>["options"][number]) => boolean;
  // defaultSelected?: T;
  options: { value: T; disabled?: boolean; onClick?: () => void }[];
  /**@default "md" */
  corners?: BasicDivProps["corners"];
  /**@default "md" */
  padding?: BasicDivProps["padding"];
  /**@default "sm" */
  gap?: BasicDivProps["gap"];
  onOptionClick?: (
    option: BasicSelectProps<T>["options"][number],
    index: number,
    options: BasicSelectProps<T>["options"]
  ) => void;
}
function BasicSelect<T extends string | number>(props: BasicSelectProps<T>) {
  return (
    <Context.Provider value={props}>
      <BasicPopover
        {...props}
        backdropBlur={props.backdropBlur}
        padding={props.padding || "md"}
        corners={props.corners || "md"}
        displayAction="click"
        content={<PopoverContent />}
      />
    </Context.Provider>
  );
}

function PopoverContent() {
  const ctx = useContext(Context),
    popoverCtx = usePopoverContext(),
    [selectedIndex, setSelectedIndex] = useState(
      ctx.isSelected
        ? ctx.options.findIndex((o) => ctx.isSelected(o))
        : undefined
    ),
    { triggerRerender } = useRerender();

  // An attemp to trigger the selected option to scroll into view
  useEffect(() => {
    setTimeout(() => {
      triggerRerender();
    }, 10);
  }, []);

  return (
    <BasicDiv spill={"auto"} gap={ctx.gap || "sm"}>
      {ctx.options.map((option, i) => {
        const selected = i === selectedIndex;
        const handleOnClick = () => {
          option.onClick?.();
          ctx.onOptionClick?.(option, i, ctx.options);
          setSelectedIndex(i);
          popoverCtx.close();
        };
        if (!option || !option?.value)
          console.error(`Index ${i} is not defined in ${ctx.options.join()}`);

        return (
          <BasicOption
            key={i}
            value={option?.value.toString()}
            disabled={option?.disabled}
            selected={selected}
            onClick={handleOnClick}
          />
        );
      })}
    </BasicDiv>
  );
}

export default BasicSelect;
