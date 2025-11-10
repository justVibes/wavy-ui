import {
  applyBasicStyle,
  BasicColor,
  BasicDiv,
  BasicHtmlElementStyleProps,
  resolveBasicColor,
  useManagedRef,
} from "@/main";
import { JSX } from "@emotion/react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";

const Context = createContext<{
  register: () => "first" | "last" | "both" | void;
  lineSeparatorColor: BasicColor;
} | null>(null);

interface RootProps {
  /**@default "fit-content" */
  width?: BasicHtmlElementStyleProps["width"];
  /**@default "onSurface[0.5]" */
  lineSeparatorColor?: BasicColor;
  rowGap?: string;
  /**@default ".5rem" */
  columnGap?: string;
  children: JSX.Element | JSX.Element[];
}
function Root(props: RootProps) {
  const childrenUids = useManagedRef<number[]>([]);
  const lineSeparatorColor = props.lineSeparatorColor || "onSurface[0.5]";
  const Children = Array.isArray(props.children)
    ? props.children
    : [props.children];
  const RenderedChildren =
    Children.length === 1
      ? Children
      : Children.map((child, i) => {
          if (i === 0 || !props.rowGap) return child;
          return (
            <>
              <p />
              <BasicDiv width={"full"} align="center">
                <p
                  style={{
                    width: "1px",
                    height: props.rowGap,
                    backgroundColor: resolveBasicColor(lineSeparatorColor),
                  }}
                />
              </BasicDiv>

              <p />
              {child}
            </>
          );
        });

  const handleRegister = () => {
    if (Children.length === 1) return "both";

    const uids = [...childrenUids.read(), 0];
    childrenUids.upsert(uids);

    if (uids.length === 1) return "first";
    else if (uids.length === Children.length) return "last";
  };

  return (
    <Context.Provider value={{ register: handleRegister, lineSeparatorColor }}>
      <BasicDiv
        grid
        width={props.width ?? "fit-content"}
        gridCols="auto auto auto"
        // backgroundColor="billsRed[0.15]"
        style={{ columnGap: props.columnGap || ".5rem" }}
      >
        {RenderedChildren}
      </BasicDiv>
    </Context.Provider>
  );
}

interface ItemProps {
  indicator?: React.ReactNode;
  /**The node that should be placed `before` (to the left of) the separator */
  before?: React.ReactNode;
  /**The node that should be placed `after` (to the right of) the separator */
  after?: React.ReactNode;
  disabled?: boolean;
  styles?: Partial<
    Record<"before" | "after", BasicHtmlElementStyleProps> & {
      indicator: Partial<
        BasicHtmlElementStyleProps & {
          /**@default ".6rem" */
          size: BasicHtmlElementStyleProps["size"];
          /**@default "circle" */
          corners: BasicHtmlElementStyleProps["corners"];
          /**@default "onSurface" */
          backgroundColor: BasicColor;
        }
      >;
    }
  >;
}
function Item(props: ItemProps) {
  const [pos, setPos] = useState<"first" | "last" | "both">();
  const { register } = useContext(Context)!;

  const { indicator, before, after } = props.styles || {};

  useEffect(() => {
    const pos = register();
    if (typeof pos === "string") setPos(pos);
  }, [pos]);

  const isSepHidden = (position: typeof pos) => {
    return pos === position || pos === "both";
  };
  return (
    <>
      <ItemContent
        disabled={props.disabled}
        style={{ ...before, align: before.align || "end" }}
      >
        {props.before}
      </ItemContent>

      <BasicDiv align="center" height={"full"}>
        <LineSeparator hide={isSepHidden("first")} />
        <BasicDiv
          style={{
            ...applyBasicStyle({
              ...(indicator || {}),
              size: indicator?.size ?? ".6rem",
              corners: indicator?.corners || "circle",
              backgroundColor: indicator?.backgroundColor || "onSurface",
            }),
            flexShrink: 0,
          }}
        >
          {props.indicator}
        </BasicDiv>

        <LineSeparator hide={isSepHidden("last")} />
      </BasicDiv>

      <ItemContent disabled={props.disabled} style={after}>
        {props.after}
      </ItemContent>
    </>
  );
}
function ItemContent(props: {
  children: React.ReactNode;
  disabled?: boolean;
  style?: BasicHtmlElementStyleProps;
}) {
  return (
    <BasicDiv
      size={"full"}
      style={{
        ...applyBasicStyle({
          ...(props.style || {}),
          fade: props.disabled ? 0.5 : props.style.fade,
        }),
        justifyContent: "center",
        flexGrow: 1,
      }}
    >
      {props.children}
    </BasicDiv>
  );
}
function LineSeparator(props: { hide: boolean }) {
  const { lineSeparatorColor } = useContext(Context)!;
  return (
    <BasicDiv
      width={"1px"}
      height={"full"}
      backgroundColor={lineSeparatorColor}
      fade={props.hide ? 0 : 1}
    />
  );
}

const BasicTimeline = {
  Root,
  Item,
};
type BasicTimelineProps = {
  RootProps: RootProps;
  ItemProps: ItemProps;
};
export default BasicTimeline;
export type { BasicTimelineProps };
