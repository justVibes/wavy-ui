import { resolveBasicColor } from "@/main";
import newStyled from "@emotion/styled";
import type * as CSS from "csstype";
import { BasicColor } from "./BasicStyle";
import { SafeOmit } from "@wavy/types";

type CssProperties = SafeOmit<CSS.Properties, "backgroundColor" | "color"> &
  Partial<Record<"backgroundColor" | "color", BasicColor>>;
type CssPseudos = Partial<
  Record<
    | CSS.Pseudos
    | `@media${" only " | " "}screen`
    | `${CSS.Pseudos | "@media"} ${string}`,
    CssProperties
  >
>;
type InlineCss = CssPseudos & CssProperties;

class StyledElement {
  private static getStyle(sx: InlineCss) {
    if (!sx) return;
    return JSON.parse(JSON.stringify(sx || {}), (key, value) => {
      if (key === "backgroundColor" || key === "color")
        return resolveBasicColor(value);
      return value;
    });
  }
  // ((sx:Sx) => Element) is used to apply the styles to the element
  static span = (sx: InlineCss) => newStyled.span({ ...this.getStyle(sx) });
  static div = (sx: InlineCss) => newStyled.div({ ...this.getStyle(sx) });
  static img = (sx: InlineCss) => newStyled.img({ ...this.getStyle(sx) });
}

export default StyledElement;
export type { CssProperties, InlineCss };
