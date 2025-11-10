import CSS from "csstype";

import CssShapes from "../resources/CssShapes";
import applyBasicStyle, {
  BasicColor,
} from "@/components/ui/low-level/html/BasicStyle";
import {
  BorderRadius,
  CssBorderOptions,
  CssDisabledCurve,
  CssMeasurement,
} from "../types/CssTypes";
import { log } from "console";
import { ColorResources, CssColors } from "@/main";

export function buildCSS(
  properties: CSS.Properties & { backgroundBlur?: string | undefined }
): CSS.Properties {
  return {
    ...properties,
    backdropFilter: properties?.backgroundBlur
      ? `blur(${properties.backgroundBlur})`
      : properties?.backdropFilter,
  };
}

export function cssTransition(options?: {
  speed?: "fast" | "normal" | "slow";
  timing?: CSS.Properties["transitionTimingFunction"];
  target?: keyof CSS.Properties;
  delay?: CSS.Properties["msTransitionDelay"];
}): CSS.Properties["transition"] {
  const speeds = {
    fast: "150ms",
    normal: "300ms",
    slow: "450ms",
  };
  const speed = options?.speed || "normal";
  const target = options?.target || "all";
  const timing = options?.timing || "linear";
  const delay = options?.delay || "0";
  return `${target} ${speeds[speed]} ${timing} ${delay}`;
}

export function solidBorder(options: CssBorderOptions) {
  return `${options.thickness || "1px"} solid ${options.color}`;
}

export function tiledBackground(params: {
  backgroundColor: BasicColor;
  borderColor: BasicColor;
  fader?: "radial" | "linear";
  tileBorderThickness?: string;
  tileSize?: string;
}) {
  const backgroundColor = resolveBasicColor(params.backgroundColor);
  const borderColor = resolveBasicColor(params.borderColor);
  const tileBorderThickness = params.tileBorderThickness || "1px";
  const tileSize = params.tileSize || "1.5rem";
  const faderType: typeof params.fader = params.fader || "radial";

  return `
          ${faderType}-gradient(transparent, ${backgroundColor} 75%),
          repeating-linear-gradient(
            ${borderColor},
            ${borderColor} ${tileBorderThickness},
            transparent ${tileBorderThickness},
            transparent ${tileSize}
          ),
          repeating-linear-gradient(
            to right,
            ${borderColor},
            ${borderColor} ${tileBorderThickness},
            transparent ${tileBorderThickness},
            transparent ${tileSize}
          )
          ${backgroundColor}
          `;
}

export function flexCenter(
  style?: CSS.Properties,
  column?: boolean
): CSS.Properties {
  return {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: column ? "column" : "row",
    ...style,
  };
}

export function borderRadius(
  params:
    | {
        radius: string;
        affectedCorners: BorderRadius[] | "top" | "bottom" | "left" | "right";
      }
    | Partial<Record<BorderRadius, string>>,
  style?: CSS.Properties
): CSS.Properties {
  const getRadii = (corner: BorderRadius) => {
    if (
      "affectedCorners" in params &&
      typeof params.affectedCorners === "string"
    ) {
      return corner.includes(params.affectedCorners)
        ? params.radius
        : undefined;
    } else if ("affectedCorners" in params) {
      return params.affectedCorners.includes(corner)
        ? params.radius
        : undefined;
    }
    return params[corner];
  };
  return {
    ...style,
    borderTopLeftRadius: getRadii("top-left"),
    borderTopRightRadius: getRadii("top-right"),
    borderBottomLeftRadius: getRadii("bottom-left"),
    borderBottomRightRadius: getRadii("bottom-right"),
  };
}

export function disabledBorderRadius(options: {
  disabledCurves: CssDisabledCurve | (() => CssDisabledCurve);
  curveRadius?: string;
}): CSS.Properties {
  const disabledCurves =
    typeof options.disabledCurves === "function"
      ? options.disabledCurves()
      : options.disabledCurves;

  const getCurve = (side: "left" | "right") => {
    if (disabledCurves === "both" || disabledCurves === side) return 0;
    return options.curveRadius || CssShapes.md;
  };

  const style: CSS.Properties = {
    borderTopLeftRadius: getCurve("left"),
    borderBottomLeftRadius: getCurve("left"),
    borderTopRightRadius: getCurve("right"),
    borderBottomRightRadius: getCurve("right"),
  };

  return style;
}

export function dragElement(elmnt: HTMLElement) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e: any) {
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: any) {
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

export function noSpaceStyle(style?: CSS.Properties): CSS.Properties {
  return { ...style, margin: 0, padding: 0 };
}

export function ellipsis(
  style?: CSS.Properties,
  options = {
    /**@default true */
    apply: true,
  }
): CSS.Properties {
  if (!options.apply) return style;
  return restrictLineCount(1, style);
}

export function nativeEllipsis(
  style?: CSS.Properties,
  options = { apply: true }
): CSS.Properties {
  if (!options.apply) return style;
  return {
    ...style,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
}

export function getScrollParent(node: HTMLElement | null) {
  let element = node;
  while (element && !isOverflown(element)) element = element.parentElement;

  return element;
}

export function isSpanMultiLine(spanElement: HTMLElement) {
  // Create a temporary element to measure single-line height
  const tempSpan = document.createElement("span");
  tempSpan.textContent = "A"; // A single character for single-line measurement
  tempSpan.style.visibility = "hidden";
  tempSpan.style.position = "absolute"; // Prevent it from affecting layout

  // Copy relevant styles for accurate measurement
  const computedStyle = getComputedStyle(spanElement);
  tempSpan.style.fontFamily = computedStyle.fontFamily;
  tempSpan.style.fontSize = computedStyle.fontSize;
  tempSpan.style.lineHeight = computedStyle.lineHeight; // Crucial for line height

  document.body.appendChild(tempSpan);
  const singleLineHeight = tempSpan.offsetHeight;
  document.body.removeChild(tempSpan); // Clean up

  // Compare with the target span's height
  const targetSpanHeight = spanElement.offsetHeight;

  // Allow for a small tolerance due to potential rendering differences
  const tolerance = 2; // Adjust as needed
  return targetSpanHeight > singleLineHeight + tolerance;
}

export function resolveBasicColor(
  basicColor: BasicColor,
  options?: Partial<{
    /**
     * @description If the name of a color is in both ColorResources and CssColors, this determines which color mapper is used.
     * @default "css"
     */
    preference: "res" | "css";
  }>
) {
  if (!basicColor || typeof basicColor !== "string") return;

  const preference = options?.preference || "css";
  const color = basicColor.replaceAll(" ", "");
  const { 0: colorRes, 1: percent } = color.split("[");
  const getCssColor = () => CssColors[color as keyof typeof CssColors];
  const getColorRes = () => {
    if (!percent) {
      return ColorResources[color as keyof typeof ColorResources];
    }
    return hexToRgba(
      ColorResources[colorRes as keyof typeof ColorResources],
      parseFloat(percent)
    );
  };

  if (preference === "css") {
    if (color in CssColors) return getCssColor();
    if (colorRes in ColorResources) return getColorRes();
  } else if (preference === "res") {
    if (colorRes in ColorResources) return getColorRes();
    if (color in CssColors) return getCssColor();
  }

  return color;
}

export const isValidHex = (hex: string) =>
  /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex);

export const convertHexUnitTo256 = (value: string) =>
  parseInt(value.repeat(2 / value.length), 16);

export function hexToRgba(hex: string, alpha: number = 1) {
  const getChunksFromString = (value: string, chunkSize: number) =>
    value.match(new RegExp(`.{${chunkSize}}`, "g"));
  const getAlphafloat = (value: number) => {
    if (typeof value !== "undefined") {
      return value / 255;
    }
    if (typeof alpha != "number" || alpha < 0 || alpha > 1) {
      return 1;
    }
    return alpha;
  };

  if (!isValidHex(hex)) {
    throw new Error(`Invalid HEX: ${hex}`);
  }

  const chunkSize = Math.floor((hex.length - 1) / 3);
  const hexArr = getChunksFromString(hex.slice(1), chunkSize);
  const [r, g, b, a] = hexArr.map(convertHexUnitTo256);
  return `rgba(${r}, ${g}, ${b}, ${getAlphafloat(a)})`;
}

export function rgbToRgba(rgb: string, alpha: number) {
  const delimiter = rgb.includes(",") ? "," : " ";
  let rgbValues = rgb
    .split("")
    .filter((char) => (delimiter + "0123456789").includes(char))
    .join("")
    .split(delimiter);

  if (rgbValues.length === 3) rgbValues.push(`${alpha}`);
  else rgbValues = rgbValues.with(3, `${alpha}`);

  return "rgba(" + rgbValues.join(delimiter) + ")";
}

export function screenHasMaxWidth(maxWidth: string) {
  return window.matchMedia(`(max-width:${maxWidth})`).matches;
}

export function screenHasMinWidth(maxWidth: string) {
  return window.matchMedia(`(min-width:${maxWidth})`).matches;
}

export function restrictLineCount(
  lineCount = 2,
  style?: CSS.Properties
): CSS.Properties {
  return {
    ...style,
    overflow: "hidden",
    width: "100%",
    display: "-webkit-box",
    WebkitLineClamp: lineCount,
    WebkitBoxOrient: "vertical",
  };
}

export function remToPx(rem: number) {
  return rem * 16;
}

export function remAsPx(rem: number) {
  return `${remToPx(rem)}px`;
}

export function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

export function computedCssVariable(cssVariable: string) {
  const root = document.body;
  const fmtVar = cssVariable.replace("var(", "").replace(")", "");
  const computedStyles = getComputedStyle(root);
  const computedValue = computedStyles.getPropertyValue(fmtVar);

  return computedValue;
}
