import { resolveBasicColor } from "@/css/helper-functions/CssHelperFunctions";
import ColorResources from "@/css/resources/ColorResources";
import CssColors from "@/css/resources/CssColors";
import CssShapes from "@/css/resources/CssShapes";
import CssSpacing from "@/css/resources/CssSpacing";
import FontSize from "@/css/resources/FontSize";
import { NoUndefinedField, RemoveSuffix, SafeExtract } from "@wavy/types";
import type * as CSS from "csstype";

const BORDER_STYLES = ["dashed", "solid", "dotted", "double"] as const;
const CLOCKWISE_SIDES = ["top", "right", "bottom", "left"] as const;

type BasicHtmlElementPosition = 0 | string;
type ElementSide = (typeof CLOCKWISE_SIDES)[number];
type BorderStyle = (typeof BORDER_STYLES)[number];
type HtmlElementDim = `${number}${"rem" | "px" | "%" | "vh" | "vw" | "em"}`;
type Size =
  | 0
  | "full"
  | `${"max" | "min" | "fit"}-content`
  | "auto"
  | HtmlElementDim;

type Append5<range extends number> = range | `${range}${5}`;
type BasicColor =
  | CSS.Properties["color"]
  | keyof typeof CssColors
  | keyof typeof ColorResources
  | `${keyof typeof ColorResources}[0.${Append5<
      1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    >}]`
  | (string & {})
  | undefined;

type ElementCorners = `top${"Left" | "Right"}` | `bottom${"Left" | "Right"}`;

interface BasicHtmlElementStyleProps
  extends Partial<
      Record<
        "spill",
        | "visible"
        | "hidden"
        | "clip"
        | "scroll"
        | "auto"
        | Partial<
            Record<"x" | "y", "visible" | "hidden" | "clip" | "scroll" | "auto">
          >
        | undefined
      >
    >,
    Partial<Record<`${"min" | "max"}${"Height" | "Width"}`, Size | undefined>> {
  className?: string | undefined;
  top?: BasicHtmlElementPosition | undefined;
  bottom?: BasicHtmlElementPosition | undefined;
  left?: BasicHtmlElementPosition | undefined;
  right?: BasicHtmlElementPosition | undefined;
  centerSelf?: boolean | "x" | "y" | undefined;
  clickable?: boolean | undefined;
  allowTextSelection?: boolean | undefined;
  disableSelection?: boolean | undefined;
  pos?: "absolute" | "relative" | "sticky" | undefined;
  padding?:
    | 0
    | keyof typeof CssSpacing
    | HtmlElementDim
    | [
        padding: keyof typeof CssSpacing | HtmlElementDim,
        sides: ElementSide | "all" | ElementSide[]
      ]
    | Partial<Record<ElementSide, keyof typeof CssSpacing | HtmlElementDim>>
    | undefined;
  translate?: Partial<{ x: string; y: string }> | undefined;
  fontSize?: keyof typeof FontSize | (string & {}) | undefined;
  centerContent?: boolean | undefined;
  flex?: string | undefined;
  hide?: boolean | undefined;
  row?: boolean | undefined;
  fontWeight?:
    | "bold"
    | "bolder"
    | "lighter"
    | "normal"
    | `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${"00" | "25" | "50"}`
    | undefined;
  aspectRatio?: number | undefined;
  size?: Size | undefined;
  height?: Size | undefined;
  width?: Size | undefined;
  color?: BasicColor;
  backgroundColor?: BasicColor;
  border?: string | undefined;
  borderColor?:
    | BasicColor
    | [color: BasicColor, sides: ElementSide | "all" | ElementSide[]]
    | Partial<Record<ElementSide, BasicColor>>
    | undefined;
  borderWidth?:
    | HtmlElementDim
    | [width: HtmlElementDim, sides: ElementSide | "all" | ElementSide[]]
    | Partial<Record<ElementSide, HtmlElementDim>>
    | undefined;
  borderStyle?:
    | BorderStyle
    | [style: BorderStyle, sides: ElementSide | "all" | ElementSide[]]
    | Partial<Record<ElementSide, BorderStyle>>
    | undefined;
  blur?: string | undefined;
  backdropBlur?: string | undefined;
  gap?: 0 | keyof typeof CssSpacing | HtmlElementDim | undefined;
  cursor?: CSS.Properties["cursor"] | undefined;
  scrollbarBackgroundColor?: BasicColor | undefined;
  scrollbarThumbColor?: BasicColor | undefined;
  corners?:
    | 0
    | HtmlElementDim
    | keyof typeof CssShapes
    | Partial<
        Record<ElementCorners, keyof typeof CssShapes | HtmlElementDim | 0> &
          Record<"top" | "bottom", never>
      >
    | Partial<
        Record<ElementCorners, never> &
          Record<"top" | "bottom", keyof typeof CssShapes | HtmlElementDim | 0>
      >
    | undefined;
  align?: "start" | "center" | "end" | "stretch" | undefined;
  justify?:
    | "center"
    | "end"
    | "stretch"
    | "space-evenly"
    | "space-between"
    | undefined;
  fade?: `0.${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | number;
  debug?: boolean;
  style?: CSS.Properties | undefined;
}

const translate = (x: string, y: string) => `translate(${x}, ${y})`;
const translateX = (amt: string) => `translateX(${amt})`;
const translateY = (amt: string) => `translateY(${amt})`;
const applyBasicStyle = (
  props: NoUndefinedField<BasicHtmlElementStyleProps>,
  debug?: boolean
): NoUndefinedField<CSS.Properties> => {
  const fontSize = (() => {
    if (props.fontSize in FontSize)
      return FontSize[props.fontSize as keyof typeof FontSize];
    return props.fontSize;
  })();

  // const extractBorderDetails = (border: BasicHtmlElementBorder) => {
  //   const isPos1Thickness = !!border?.[1] && typeof border[1] === "number";
  //   const thickness = (value: number) =>
  //     value !== undefined ? `${value}px` : undefined;

  //   return {
  //     thickness: thickness(
  //       isPos1Thickness ? (border?.[1] as number) : (border?.[2] as number)
  //     ),
  //     side: isPos1Thickness
  //       ? undefined
  //       : (border?.[1] as ElementSide | ElementSide[]),
  //     type:
  //       ((isPos1Thickness
  //         ? border?.[2]
  //         : border?.[3]) as BasicHtmlElementBorder["3"]) ?? "solid",
  //   };
  // };

  const { overflowX, overflowY } = (() => {
    const spill = props?.spill || {};
    if (!spill) return;

    return {
      overflowX: typeof spill === "string" ? spill : spill?.x || "visible",
      overflowY: typeof spill === "string" ? spill : spill?.y || "visible",
    };
  })();
  function getSize(
    key: SafeExtract<
      keyof typeof props,
      "height" | "width" | "maxHeight" | "maxWidth" | "minHeight" | "minWidth"
    >
  ) {
    if (props.style?.[key]) return props.style[key];
    if (
      (props.size || props.size === 0) &&
      (key === "height" || key === "width")
    )
      return props.size === "full" ? "100%" : props.size;

    return props[key] === "full" ? "100%" : props[key];
  }

  const style: NoUndefinedField<CSS.Properties> = {
    top:
      props.centerSelf === true || props.centerSelf === "y" ? "50%" : props.top,
    left:
      props.centerSelf === true || props.centerSelf === "x"
        ? "50%"
        : props.left,
    right: props.right,
    bottom: props.bottom,
    cursor: props.clickable ? "pointer" : props.cursor,
    scrollbarColor: `${resolveBasicColor(
      props.scrollbarThumbColor || "inherit"
    )} ${resolveBasicColor(props.scrollbarThumbColor || "inherit")}`,
    transform:
      props.centerSelf === true
        ? translate("-50%", "-50%")
        : props.centerSelf === "x"
        ? translateX("-50%")
        : props.centerSelf === "y"
        ? translateY("-50%")
        : props.translate?.x && props.translate?.y
        ? translate(props.translate.x, props.translate.y)
        : props.translate?.x
        ? translateX(props.translate.x)
        : props.translate?.y
        ? translateY(props.translate.y)
        : undefined,
    position:
      props.pos === "absolute" || props.centerSelf ? "absolute" : props.pos,
    padding: getPadding(props.padding),
    fontSize,
    fontWeight: props.fontWeight,
    border: props.border,
    borderColor: getBorderColor(props.borderColor),
    borderWidth: getBorderWidth(
      props.borderWidth,
      props.borderColor ? "1px" : undefined
    ),
    borderStyle: getBorderStyle(
      props.borderStyle,
      props.borderColor ? "solid" : undefined
    ),
    lineHeight: fontSize
      ? `calc(${fontSize} + (${fontSize} * .15))`
      : undefined,
    borderRadius: getBorderRadius(props.corners),
    userSelect: props.disableSelection
      ? "none"
      : props.allowTextSelection
      ? "text"
      : undefined,
    minHeight: getSize("minHeight"),
    minWidth: getSize("minWidth"),
    maxHeight: getSize("maxHeight"),
    maxWidth: getSize("maxWidth"),
    height: getSize("height"),
    width: getSize("width"),
    display: props.hide ? "none" : undefined,
    flexDirection: props.row ? "row" : "column",
    flex: props.flex,
    backgroundColor: resolveBasicColor(props.backgroundColor),
    color: resolveBasicColor(props.color),
    gap: getGap(props.gap),
    overflowX,
    overflowY,
    aspectRatio: props.aspectRatio,
    opacity: props.fade,
    alignItems: props.centerContent ? "center" : props.align || "start",
    justifyContent: props.centerContent ? "center" : props.justify || "start",
    backdropFilter: props.backdropBlur
      ? `blur(${props.backdropBlur})`
      : undefined,
    filter: props.blur ? `blur(${props.blur})` : undefined,
    ...props.style,
  };

  Object.keys(style).forEach((key) => {
    const validKey = key as keyof typeof style;
    let value = style[validKey];

    if (typeof value === "string") value = value.trim();
    if (!value && value !== 0) delete style[validKey];
  });

  if (debug || props.debug) console.log({ props, style });

  return style;
};

function getBorderColor(color: BasicHtmlElementStyleProps["borderColor"]) {
  if (!color) return;

  const noColor = "transparent";
  if (typeof color === "string") return resolveBasicColor(color);
  return CLOCKWISE_SIDES.map((side) => {
    if (Array.isArray(color)) {
      const { 0: value, 1: sides } = color;
      const hasColor = Array.isArray(sides)
        ? (sides as string[]).includes(side)
        : [side, "all"].includes(sides);

      if (hasColor) return resolveBasicColor(value);
      return noColor;
    }
    if (typeof color === "object" && side in color)
      return resolveBasicColor(color[side as keyof typeof color]);

    return noColor;
  }).join(" ");
}

function getBorderWidth(
  width: BasicHtmlElementStyleProps["borderWidth"],
  defaultWidth: string
) {
  if (!width) return defaultWidth;
  const noWidth = 0;

  if (typeof width === "string") return width;
  return CLOCKWISE_SIDES.map((side) => {
    if (Array.isArray(width)) {
      const { 0: value, 1: sides } = width;
      const hasWidth = Array.isArray(sides)
        ? sides.includes(side)
        : [side, "all"].includes(sides);

      if (hasWidth) return value;
      return noWidth;
    }

    if (typeof width === "object" && side in width)
      return width[side as keyof typeof width];

    return noWidth;
  }).join(" ");
}

function getBorderStyle(
  style: BasicHtmlElementStyleProps["borderStyle"],
  defaultStyle: BorderStyle
) {
  if (!style) return defaultStyle;
  const noStyle = 0;

  if (typeof style === "string") return style;

  return CLOCKWISE_SIDES.map((side) => {
    if (Array.isArray(style)) {
      const { 0: value, 1: sides } = style;
      const hasStyle = Array.isArray(sides)
        ? (sides as string[]).includes(side)
        : [side, "all"].includes(sides);

      if (hasStyle) return value;
      return noStyle;
    }
    if (typeof style === "object" && side in style)
      return style[side as keyof typeof style];

    return noStyle;
  }).join(" ");
}

function getPadding(
  padding: BasicHtmlElementStyleProps["padding"] | undefined
) {
  const noPadding = "0px";

  const getPaddingValue = (pad: string) => {
    if (!pad) return noPadding;
    if (pad in CssSpacing) return CssSpacing[pad as keyof typeof CssSpacing];
    return pad;
  };

  if (!padding) return noPadding;

  if (typeof padding === "string") return getPaddingValue(padding);
  return CLOCKWISE_SIDES.map((side): string => {
    if (Array.isArray(padding)) {
      const { 0: value, 1: sides } = padding;
      const hasPadding = Array.isArray(sides)
        ? sides.includes(side)
        : sides === side;

      if (hasPadding) return getPaddingValue(value);
      return noPadding;
    }

    if (typeof padding === "object" && side in padding)
      return getPaddingValue(padding[side as keyof typeof padding]);

    return noPadding;
  }).join(" ");
}

function getBorderRadius(radius: BasicHtmlElementStyleProps["corners"]) {
  const noRadius = 0;
  const getValue = (radius: HtmlElementDim | keyof typeof CssShapes) => {
    if (!radius) return noRadius;
    if (radius in CssShapes) return CssShapes[radius as keyof typeof CssShapes];
    return radius as HtmlElementDim;
  };

  if (!radius) return noRadius;
  if (typeof radius === "string") return getValue(radius);

  // The padding format `<top-left> <top-right> <bottom-right> <bottom-left>`
  const syntax: (keyof typeof radius)[] = [
    "topLeft",
    "topRight",
    "bottomRight",
    "bottomLeft",
  ];

  return syntax
    .map((corner) => {
      const value = radius?.[corner];

      if (corner.includes("top") && !!radius?.["top"])
        return getValue(radius.top);
      if (corner.includes("bottom") && !!radius?.["bottom"])
        return getValue(radius.bottom);
      if (!value) return noRadius;
      return getValue(value);
    })
    .join(" ");
}

function getGap(gap: BasicHtmlElementStyleProps["gap"]) {
  if (!gap || typeof gap !== "string") return;
  if (gap in CssSpacing) return CssSpacing[gap as keyof typeof CssSpacing];
  return gap;
}

export type {
  BasicColor,
  BasicHtmlElementStyleProps,
  Size as ElementSize,
  HtmlElementDim,
};
export default applyBasicStyle;
