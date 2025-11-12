import {
  applyBasicStyle,
  BasicColor,
  BasicDiv,
  BasicPopover,
  BasicSpan,
  CssShapes,
  getFileIcon,
  InlineCss,
  resolveBasicColor,
} from "@/main";
import { createContext, useContext, useEffect, useRef, type JSX } from "react";
import type { IconType } from "react-icons";
import { BasicDivProps } from "../html/div/BasicDiv";
import { LocalFile, SafeOmit, SanitizeFile } from "@wavy/types";
import { format } from "@wavy/fn";
import { BasicSpanProps } from "../html/span/BasicSpan";

// const NAV_THICKNESS = "3rem";
const ID = {
  sidebar: "fv-sidebar",
  topbar: "fv-topbar",
  viewer: "fv-viewer",
};

const Context = createContext<{
  borderColor: string;
  corners: string;
  navThickness: FileViewerProps.RootProps["navThickness"];
}>(null);

function Root(props: FileViewerProps.RootProps) {
  // It's resolved here so we don't have to resolve it again in the viewer.
  const borderColor = resolveBasicColor(props.borderColor || "outline[0.1]");
  const corners = CssShapes["md"];
  return (
    <Context.Provider
      value={{
        borderColor,
        corners,
        navThickness: props.navThickness || "3rem",
      }}
    >
      <BasicDiv
        minHeight={props.minHeight}
        maxHeight={props.maxHeight}
        minWidth={props.minWidth}
        maxWidth={props.maxWidth}
        corners={corners}
        size={props.size}
        backgroundColor={props.backgroundColor ?? "surfaceContainer"}
        height={props.height ?? "30rem"}
        width={props.width ?? "40rem"}
        spill={"hidden"}
        grid
        gridCols={"auto 1fr"}
        gridRows={"auto 1fr"}
        borderColor={borderColor}
        style={{
          gridTemplateAreas: `"${ID.topbar} ${ID.topbar}" "${ID.sidebar} ${ID.viewer}"`,
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        }}
      >
        {props.children}
      </BasicDiv>
    </Context.Provider>
  );
}

function Indicator(props: FileViewerProps.IndicatorProps) {
  const { navThickness } = useContext(Context);
  const Icon = getFileIcon(props.file.typeAlias);

  return (
    <BasicDiv row align="center">
      <Icon.filled
        style={applyBasicStyle({
          size: navThickness || props.styles?.icon?.size,
          color: "pdf",
          style: {
            padding:
              applyBasicStyle({ padding: props.styles?.icon?.padding })
                ?.padding ?? `calc(${navThickness}/4.61)`,
          },
        })}
      />
      <BasicDiv>
        <BasicSpan
          color={props.styles?.filename?.color}
          fontWeight={props.styles?.filename?.fontWeight}
          fontSize={props.styles?.filename?.fontSize || "1rem"}
          text={props.file.name}
        />
        <BasicDiv
          row
          fontSize={props.styles?.fileMetadata?.fontSize || ".7rem"}
          gap={props.styles?.fileMetadata?.gap ?? "sm"}
          fade={props.styles?.fileMetadata?.fade ?? 0.5}
          align="center"
        >
          <BasicSpan
            fontWeight="bold"
            text={(props.file.ext || props.file.typeAlias)?.toUpperCase()}
          />
          <BasicDiv
            size={props.styles?.fileMetadataSeparator?.size || ".3rem"}
            corners={props.styles?.fileMetadataSeparator?.corners ?? "circle"}
            backgroundColor={
              props.styles?.fileMetadataSeparator?.color || "onSurface"
            }
          />
          <BasicSpan
            fade={0.75}
            text={format("file-size", props.file.sizeInBytes)}
          />
        </BasicDiv>
      </BasicDiv>
    </BasicDiv>
  );
}

function Topbar(props: FileViewerProps.TopbarProps) {
  const { navThickness } = useContext(Context);
  const { children, ...rest } = props as BasicDivProps & { children: any };

  return (
    <BasicDiv
      {...rest}
      row
      id={ID.topbar}
      height={navThickness}
      width={"full"}
      align="center"
      gap={props.gap ?? "md"}
      padding={props.children ? ["md", "right"] : undefined}
      justify={props.justify || "space-between"}
      style={{ ...props.style, gridArea: ID.topbar }}
    >
      {props.children}
    </BasicDiv>
  );
}

const SidebarContext = createContext<{
  onOptionClick: (option: string) => void;
} | null>(null);

function SidebarRoot<T extends string>(
  props: FileViewerProps.SidebarRootProps<T>
) {
  const { children, onOptionClick, ...rest } = props;
  const { navThickness } = useContext(Context);
  return (
    <SidebarContext.Provider
      value={{ onOptionClick: (o) => props.onOptionClick?.(o as T) }}
    >
      <BasicDiv
        {...rest}
        id={ID.sidebar}
        height={"full"}
        width={navThickness}
        align="center"
        gap={rest.gap || "md"}
        padding={["md", ["top", "bottom"]]}
        style={{ ...rest.style, gridArea: ID.sidebar }}
      >
        {props.children}
      </BasicDiv>
    </SidebarContext.Provider>
  );
}

function SidebarOption(props: FileViewerProps.SidebarOptionProps) {
  const { onOptionClick } = useContext(SidebarContext)!;

  const handleOnClick = () => {
    props.onClick?.();
    onOptionClick(props.label);
  };
  return (
    <BasicPopover
      displayAction="hover"
      placement="right"
      fontSize="sm"
      content={props.label}
      asChild={props.disabled}
    >
      <BasicDiv
        fade={props.disabled ? 0.5 : 1}
        cursor={
          props.disabled
            ? "not-allowed"
            : props.selected
            ? "default"
            : "pointer"
        }
        corners={props.corners ?? "md"}
        padding={props.padding ?? "md"}
        borderColor={props.selected ? "onPrimaryContainer[0.1]" : "transparent"}
        css={{
          transition: "background-color 200ms linear",
          backgroundColor:
            props.backgroundColor?.(props.selected) ??
            (props.selected ? "primaryContainer" : "outline[0.1]"),
          color:
            props.color?.(props.selected) ??
            (props.selected ? "onPrimaryContainer" : "onSurface"),
          ":hover": props.selected
            ? undefined
            : {
                ...props.css?.[":hover"],
                backgroundColor:
                  props.css?.[":hover"].backgroundColor || "outline[0.25]",
              },
        }}
        onClick={props.disabled ? undefined : handleOnClick}
      >
        {<props.icon size={props.iconSize ?? "1.1rem"} />}
      </BasicDiv>
    </BasicPopover>
  );
}

function Viewer(props: FileViewerProps.ViewerProps) {
  const { borderColor, corners } = useContext(Context);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For the initial render
    updateStyles();
    const observer = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        // For everytime the parent's children changes
        if (mutation.type === "childList") updateStyles();
      }
    });

    observer.observe(ref.current?.parentNode!, { childList: true });
    return () => {
      observer.disconnect();
    };
  }, []);

  const updateStyles = () => {
    const knownSiblings: (keyof typeof ID)[] = ["sidebar", "topbar"];

    const parent = ref.current?.parentElement;
    const aliveSiblings = knownSiblings.filter((id) =>
      parent?.querySelector(`#${ID[id]}`)
    );

    if (knownSiblings.every((sib) => aliveSiblings.includes(sib))) {
      Object.assign(ref.current?.style!, {
        borderRadius: `${corners} 0 0 0`,
        borderColor: `${borderColor} transparent transparent ${borderColor}`,
      });
    } else if (aliveSiblings.includes("sidebar")) {
      Object.assign(ref.current?.style!, {
        borderRadius: `${corners} 0 0 ${corners}`,
        borderLeftColor: borderColor,
      });
    } else if (aliveSiblings.includes("topbar")) {
      Object.assign(ref.current?.style!, {
        borderRadius: 0,
        borderTopColor: borderColor,
      });
    } else {
      Object.assign(ref.current?.style!, {
        borderRadius: corners,
        borderColor: borderColor,
      });
    }
  };

  return (
    <BasicDiv
      ref={ref}
      size={"full"}
      centerContent={props.centerContent ?? true}
      backgroundColor={props.backgroundColor || "onSurface[0.1]"}
      color={props.color || "onSurface"}
      spill={"hidden"}
      borderColor={"transparent"}
      style={{
        gridArea: ID.viewer,
        boxShadow:
          "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
      }}
    >
      {props.children}
    </BasicDiv>
  );
}

const FileViewer = {
  Root,
  Sidebar: SidebarRoot,
  SidebarOption,
  Topbar,
  Viewer,
  Indicator,
};

type SanitizedBasicDivProps = SafeOmit<
  BasicDivProps,
  | "row"
  | "id"
  | "height"
  | "width"
  | "align"
  | "padding"
  | "size"
  | "minHeight"
  | "minWidth"
  | "maxHeight"
  | "maxWidth"
  | "asChildren"
  | "aspectRatio"
>;

declare namespace FileViewerProps {
  interface RootProps
    extends Partial<
      Record<`${"min" | "max"}${"Height" | "Width"}`, BasicDivProps["width"]>
    > {
    /**@default "outline[0.1]" */
    borderColor?: BasicColor;
    size?: BasicDivProps["size"];
    /**@default "30rem"*/
    height?: BasicDivProps["height"];
    /**@default "40rem" */
    width?: BasicDivProps["width"];
    /**@default "surfaceContainer" */
    backgroundColor?: BasicColor;
    /**The height of the `Topbar` and the width of the `Sidebar`
     * @default "3rem" */
    navThickness?: `${number}${"rem" | "em" | "px"}`;
    children:
      | JSX.Element
      | [JSX.Element, JSX.Element]
      | [JSX.Element, JSX.Element, JSX.Element];
  }

  interface TopbarProps extends SanitizedBasicDivProps {
    children?: JSX.Element | JSX.Element[];
  }

  interface SidebarRootProps<T> extends SanitizedBasicDivProps {
    children: JSX.Element | JSX.Element[];
    /**@default "md" */
    gap?: BasicDivProps["gap"];
    onOptionClick?: (option: T) => void;
  }
  interface SidebarOptionProps {
    label: string;
    icon: IconType;
    /**@default "1.1rem" */
    iconSize?: `${number}${"rem" | "px" | "em"}`;
    /**@default "md" */
    corners?: BasicDivProps["corners"];
    /**@default "md" */
    padding?: BasicDivProps["padding"];
    disabled?: boolean;
    selected?: boolean;
    /**@default selected ? "primaryContainer" : "outline[0.1]"*/
    backgroundColor?: (selected: boolean) => BasicColor;
    /**@default selected ? "onPrimaryContainer" : "onSurface" */
    color?: (selected: boolean) => BasicColor;
    css?: Partial<{
      ":hover": InlineCss[":hover"] & {
        /**@default "outline[0.25]" */
        backgroundColor?: BasicColor;
      };
    }>;
    onClick?: () => void;
  }

  interface ViewerProps {
    children: JSX.Element;
    /**@default "onSurface[0.1]"*/
    backgroundColor?: BasicColor;
    /**@default "onSurface" */
    color?: BasicColor;
    /**@default true */
    centerContent?: boolean;
  }

  interface IndicatorProps {
    file: LocalFile | SanitizeFile<LocalFile>;
    styles?: Partial<{
      icon: Partial<{
        /**@default RootProps.navThickness */
        size: BasicDivProps["size"];
        /**@default calc(RootProps.navThickness/4.61) */
        padding: BasicDivProps["padding"];
      }>;
      filename: Partial<{
        /**@default "1rem" */
        fontSize?: BasicSpanProps["fontSize"];
        fontWeight?: BasicSpanProps["fontWeight"];
        color?: BasicColor;
      }>;
      fileMetadata: Partial<{
        /**@default ".7rem" */
        fontSize?: BasicSpanProps["fontSize"];
        /**@default "sm" */
        gap?: BasicDivProps["gap"];
        /**@default 0.5 */
        fade?: BasicDivProps["fade"];
      }>;
      fileMetadataSeparator: Partial<{
        /**@default ".3rem" */
        size: BasicDivProps["size"];
        /**@default "circle" */
        corners?: BasicDivProps["corners"];
        /**@default "onSurface" */
        color?: BasicColor;
      }>;
    }>;
  }
}

export default FileViewer;
export type { FileViewerProps };
