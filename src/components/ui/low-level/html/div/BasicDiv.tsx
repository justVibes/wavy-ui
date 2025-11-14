import {
  memo,
  MouseEventHandler,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

import { isOverflown } from "@/css/helper-functions/CssHelperFunctions";
import CssSpacing from "@/css/resources/CssSpacing";
import { useManagedRef } from "@/main";
import { isEmpty, strictArray } from "@wavy/fn";
import applyBasicStyle, { BasicHtmlElementStyleProps } from "../BasicStyle";
import StyledElement, { InlineCss } from "../StyledElements";
import {
  applyCoreHTMLProps,
  BasicHtmlElementCoreProps,
} from "../BasicHtmlElementCore";

interface BasicDivProps
  extends BasicHtmlElementStyleProps,
    BasicHtmlElementCoreProps<HTMLDivElement> {
  flexWrap?: boolean | undefined;
  grid?: boolean | undefined;
  gridCols?: string | undefined;
  gridRows?: string | undefined;
  draggable?: boolean | undefined;
  asChildren?: boolean;
  rememberScrollPos?: boolean;
  updateScrollPosDeps?: React.DependencyList;
  overflowPadding?: keyof typeof CssSpacing;
  enableYFaders?: boolean;
  decreaseYFaderPadding?: boolean;
  css?: InlineCss;
  onScroll?: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
}
function BasicDiv(props: PropsWithChildren<BasicDivProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const scrollPosRef = useManagedRef({ top: 0, left: 0 });

  props.rememberScrollPos &&
    useEffect(() => {
      const scrollPos = scrollPosRef.read();
      if (
        ref.current &&
        [scrollPos.top, scrollPos.left].some((pos) => Boolean(pos))
      ) {
        ref.current.scrollTop = scrollPos?.top ?? 0;
        ref.current.scrollLeft = scrollPos?.left ?? 0;
      }
    }, props.updateScrollPosDeps);

  (props.rememberScrollPos || props.overflowPadding) &&
    useEffect(() => {
      if (ref.current && isOverflown(ref.current) && !overflowing) {
        setOverflowing(true);
      }
    }, []);

  const fadeAmt = "10%";
  const fadeMask = `linear-gradient(to bottom, transparent, black calc(${fadeAmt}/4), black calc(100% - ${fadeAmt}), transparent) `;
  const contentPadding = props.decreaseYFaderPadding ? "2vh" : "5rem";
  const basicHtmlStyle = applyBasicStyle({
    ...props,
    spill:
      props.spill === "hidden"
        ? "hidden"
        : props.spill || (props.rememberScrollPos ? "auto" : undefined),
    padding: props.padding || {
      right:
        props.overflowPadding && overflowing
          ? props.overflowPadding
          : undefined,
      top: props.enableYFaders ? contentPadding : undefined,
      bottom: props.enableYFaders ? contentPadding : undefined,
    },
  });

  const StyledDiv = StyledElement.div(props.css);

  if (props.hide) return;
  if (props.asChildren) return props.children;
  return (
    <StyledDiv
      {...applyCoreHTMLProps(props)}
      ref={props.rememberScrollPos || props.overflowPadding ? ref : props.ref}
      draggable={props.draggable}
      onScroll={(e) => {
        const scrollTop = ref?.current?.scrollTop;
        const scrollLeft = ref?.current?.scrollLeft;
        if (!overflowing && props.overflowPadding) setOverflowing(true);
        if (!isEmpty(strictArray([scrollTop, scrollLeft]))) {
          scrollPosRef.upsert({
            top: scrollTop ?? 0,
            left: scrollLeft ?? 0,
          });
        }

        props.onScroll?.(e);
      }}
      style={{
        ...basicHtmlStyle,
        display: props.grid ? "grid" : basicHtmlStyle.display || "flex",
        flexWrap:
          basicHtmlStyle.flexWrap || (props.flexWrap ? "wrap" : undefined),
        gridTemplateColumns:
          basicHtmlStyle?.gridTemplateColumns || props.gridCols || "1fr",
        gridTemplateRows: basicHtmlStyle?.gridTemplateRows || props.gridRows,
        WebkitMaskImage: props.enableYFaders && fadeMask,
        maskImage: props.enableYFaders && fadeMask,
      }}
    >
      {props.children}
    </StyledDiv>
  );
}

export default BasicDiv;
export type { BasicDivProps };
