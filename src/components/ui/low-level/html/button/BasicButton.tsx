import { BasicColor, resolveBasicColor } from "@/main";
import {
  AbsoluteCenter,
  Button,
  ButtonProps,
  Icon,
  IconProps,
  Spinner,
} from "@chakra-ui/react";
import React, { JSX, useEffect, useState } from "react";
import { IconType } from "react-icons";
import { FaFolder } from "react-icons/fa";
import applyBasicStyle, { HtmlElementDim } from "../BasicStyle";
import { BasicDivProps } from "../div/BasicDiv";
import { ButtonSize } from "./components/ButtonSize";
import { SafeOmit } from "@wavy/types";
import {
  applyCoreHTMLProps,
  BasicHtmlElementCoreProps,
} from "../BasicHtmlElementCore";

const ICON_PRESET_SIZES = [
  "inherit",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "xs",
] as const;
const BUTTON_PRESET_SIZES = [
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "xs",
  "2xs",
] as const;

type Addon = JSX.Element | IconType;
interface BaseProps
  extends SafeOmit<
      BasicDivProps,
      | "css"
      | "row"
      | "size"
      | "onScroll"
      | "clickable"
      | "enableYFaders"
      | "overflowPadding"
      | "updateScrollPosDeps"
      | "decreaseYFaderPadding"
      | keyof BasicHtmlElementCoreProps<HTMLDivElement>
    >,
    BasicHtmlElementCoreProps<HTMLButtonElement> {
  async?: boolean;
  disabled?: boolean;
  disabledOpacity?: number;
  spinnerColor?: BasicColor;
  pendingDelay?: number;
  /**
   * @default "md"
   */
  size?: (typeof BUTTON_PRESET_SIZES)[number] | HtmlElementDim;
  variant?: "outline" | "standard";
  borderColor?: BasicColor;
  iconSize?: (typeof ICON_PRESET_SIZES)[number] | HtmlElementDim;
  // onClick?: (
  //   event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  // ) => void | Promise<void>;
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
}

type OptionalProps =
  | {
      leadingEl?: Addon;
      children?: never;
      text?: string;
      trailingEl?: Addon;
    }
  | {
      leadingEl?: never;
      children?: React.ReactNode;
      text?: never;
      trailingEl?: never;
    };

type BasicButtonProps = BaseProps & OptionalProps & {};

function BasicButton(props: BasicButtonProps) {
  const [pending, setPending] = useState(false);

  const disabled = props.disabled || pending;

  const handleOnClick: (typeof props)["onClick"] = async (e) => {
    if (disabled) return;
    if (!props.async) return props.onClick?.(e);

    setPending(true);
    await props.onClick?.(e);
    setTimeout(() => setPending(false), props.pendingDelay || 1);
  };

  const getAddon = (addon: Addon) => {
    if (!addon) return;
    if (typeof addon === typeof FaFolder) {
      const isPresetSize = (
        size: typeof props.iconSize
      ): size is (typeof ICON_PRESET_SIZES)[number] => {
        return (
          typeof size === "string" &&
          ([...ICON_PRESET_SIZES] as string[]).includes(size)
        );
      };
      return (
        <Icon
          size={isPresetSize(props.iconSize) ? props.iconSize : undefined}
          boxSize={isPresetSize(props.iconSize) ? undefined : props.iconSize}
          as={addon as IconType}
        />
      );
    }
    return addon as JSX.Element;
  };
  const LeadingEl = getAddon(props.leadingEl);
  const TrailingEl = getAddon(props.trailingEl);

  const isPresetSize = (
    size: typeof props.size
  ): size is (typeof BUTTON_PRESET_SIZES)[number] => {
    return (
      typeof size === "string" &&
      ([...BUTTON_PRESET_SIZES] as string[]).includes(size)
    );
  };
  const { size, ...rest } = props;
  return (
    <Button
      {...applyCoreHTMLProps(props)}
      disabled={disabled}
      size={isPresetSize(size) ? size : undefined}
      style={applyBasicStyle({
        ...rest,
        size: isPresetSize(size) ? undefined : size,
        clickable: !disabled,
        row: true,
        centerContent: true,
        gap: props.gap || "md",
        corners: props.corners || "md",
        padding: props.padding || "md",
        color:
          props.color ||
          (props.variant === "outline" ? "onSurface" : "onPrimary"),
        backgroundColor:
          props.backgroundColor ||
          (props.variant === "outline" ? "transparent" : "primary"),
        border: props.border,
        borderColor:
          props.borderColor ||
          (props.variant === "outline" ? "onSurface[0.1]" : undefined),
        fade: disabled ? props.disabledOpacity || 0.5 : props.fade || 1,
        pos: pending ? "relative" : props.pos,
        height: props.height || "fit-content",
        width: props.width || "fit-content",
      })}
      onClick={handleOnClick}
      onMouseDown={props.onMouseDown}
    >
      {LeadingEl}
      {props.text}
      {props.children}
      {TrailingEl}

      {pending && (
        <AbsoluteCenter>
          <Spinner
            size={"sm"}
            animationDuration={"slowest"}
            borderWidth={".1rem"}
            color={
              props.spinnerColor
                ? resolveBasicColor(props.spinnerColor)
                : "blue.500"
            }
          />
        </AbsoluteCenter>
      )}
    </Button>
  );
}

const createBasicButton = <
  Props extends keyof PresetProps extends keyof BasicButtonProps
    ? Omit<BasicButtonProps, keyof PresetProps>
    : BasicButtonProps,
  PresetProps extends BasicButtonProps
>(defaults: {
  preset: PresetProps;
  optional?: BasicButtonProps;
}) => {
  return (props: Props) => {
    const propsFactory = () => {
      const propsCopy = { ...props, ...defaults.preset };

      for (const key of Object.keys(defaults.optional || {})) {
        const validKey = key as keyof BasicButtonProps;
        const propExists = validKey in propsCopy;
        const propUnset = [undefined, null].includes(propsCopy[validKey]);
        
        if (!propExists || propUnset) {
          //@ts-expect-error
          propsCopy[validKey] = defaults.optional[validKey];
        }
      }

      return propsCopy as BasicButtonProps;
    };

    return <BasicButton {...propsFactory()} />;
  };
};

export default BasicButton;
export type { BasicButtonProps };
export { createBasicButton };
