import { resolveBasicColor } from "@/main";
import newStyled from "@emotion/styled";
import type * as CSS from "csstype";
import { BasicColor } from "./BasicStyle";
import { SafeOmit } from "@wavy/types";

type CssProperties = SafeOmit<CSS.Properties, "backgroundColor" | "color"> &
  Partial<Record<"backgroundColor" | "color", BasicColor>>;
type CssPseudos = Partial<Record<CSS.Pseudos | `${CSS.Pseudos} ${string}`, CssProperties>>;
type Sx = CssPseudos & CssProperties;

class StyledElement {
  private static getStyle(sx: Sx) {
    if (!sx) return;
    return JSON.parse(JSON.stringify(sx || {}), (key, value) => {
      if (key === "backgroundColor" || key === "color")
        return resolveBasicColor(value);
      return value;
    });
  }
  // ((sx:Sx) => Element) is used to apply the styles to the element
  static span = (sx: Sx) => newStyled.span({ ...this.getStyle(sx) });
  static div = (sx: Sx) => newStyled.div({ ...this.getStyle(sx) });
  static img = (sx: Sx) => newStyled.img({ ...this.getStyle(sx) });
}

export default StyledElement;
export type { CssProperties, Sx };
