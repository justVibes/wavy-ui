import { camelCaseToLetter, lastIndex } from "@wavy/fn";
import type { SafeExclude, SafeOmit } from "@wavy/types";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type JSX,
} from "react";
import { BasicColor, BasicHtmlElementStyleProps } from "../BasicStyle";
import { BasicDiv, BasicSpan } from "@/main";
import { getTableColName, getTableGridCols } from "./components/util";
import { TableColumnConfig } from "./components/types";
import { BasicDivProps } from "../div/BasicDiv";

const Context = createContext<
  | (Pick<
      BasicTableProps.RootProps<string>,
      "columns" | "entries" | "columnGap" | "rowGap"
    > &
      SafeOmit<RootStyles, "gap"> & {
        gridCols: string;
        onAutoColumnWidthsComputed: (widthMap: Map<string, number>) => void;
      })
  | null
>(null);

type RootStyles = {
  /**@default "md" */
  gap?: BasicHtmlElementStyleProps["gap"];
  rowGap?: BasicHtmlElementStyleProps["gap"];
  columnGap?: BasicHtmlElementStyleProps["gap"];
  textAlign?: "left" | "center" | "right";
  /**@default "sm" */
  padding?: BasicHtmlElementStyleProps["padding"];
};

function Root<T extends string>(props: BasicTableProps.RootProps<T>) {
  const defaultColWeight = "1fr";
  const [gridCols, setGridCols] = useState(
    getTableGridCols(props.columns, defaultColWeight)
  );

  const gap = props.gap ?? "md";

  const Children = (
    Array.isArray(props.children) ? props.children : [props.children]
  ).filter((_, i) => i < 2);

  const columns = (() => {
    if (!props.columnWeight) return props.columns;
    return props.columns.map((col) => {
      const colConfig = typeof col === "object" ? col : ({} as TableColumnConfig);
      return {
        ...colConfig,
        name: getTableColName(col),
        weight: "weight" in colConfig ? colConfig.weight : props.columnWeight,
      };
    });
  })();

  return (
    <Context.Provider
      value={{
        ...props,
        gridCols,
        columns,
        padding: props.padding ?? "sm",
        columnGap: props.columnGap ?? gap,
        rowGap: props.rowGap ?? gap,
        onAutoColumnWidthsComputed: (widthMap) => {
          const updatedColumns = props.columns.map(
            (col): BasicTableProps.RootProps<string>["columns"][number] => {
              const maxWidth = widthMap.get(getTableColName(col));

              if (maxWidth) {
                return { ...(col as any), weight: `${maxWidth}px` };
              }
              return col;
            }
          );
          setGridCols(getTableGridCols(updatedColumns, defaultColWeight));
        },
      }}
    >
      <BasicDiv
        height={props.height}
        width={props.width}
        minHeight={props.minHeight}
        maxHeight={props.maxHeight}
        minWidth={props.minWidth}
        maxWidth={props.maxWidth}
        backgroundColor={props.backgroundColor}
        color={props.color}
      >
        {Children}
      </BasicDiv>
    </Context.Provider>
  );
}

function Header(props: BasicTableProps.HeaderProps) {
  const ctx = useContext(Context)!;
  const separatorColor = ["none", 0].includes(props.separatorColor!)
    ? undefined
    : props.separatorColor ?? "onSurface[0.1]";

  return (
    <BasicDiv
      grid
      width={"full"}
      gap={ctx.columnGap}
      gridCols={ctx.gridCols}
      borderColor={
        props.borderColor ||
        (separatorColor ? [separatorColor, "bottom"] : undefined)
      }
      spill={"hidden"}
      padding={props.padding ?? ctx.padding}
      corners={props.corners ?? (separatorColor ? 0 : undefined)}
      color={props.color}
      fontSize={props.fontSize}
      backgroundColor={props.backgroundColor}
      align="center"
    >
      {ctx.columns.map((col, i) => {
        const colName = getTableColName(col);
        return (
          <BasicSpan
            width={"full"}
            borderColor={
              separatorColor && i !== lastIndex(ctx.columns)
                ? [separatorColor, "right"]
                : undefined
            }
            textAlign={props.textAlign ?? ctx.textAlign}
            key={colName + i}
            text={
              !props.formatColumnName ||
              props.formatColumnName === "camelToLetter"
                ? camelCaseToLetter(colName)
                : props.formatColumnName?.(colName) ?? colName
            }
            style={{ flexGrow: 1 }}
          />
        );
      })}
    </BasicDiv>
  );
}

function Body(props: BasicTableProps.BodyProps) {
  const ctx = useContext(Context)!;
  let columnWidthMap = new Map<string, number>();

  useEffect(() => {
    const cleanup = () => columnWidthMap.clear();

    return cleanup;
  }, []);

  return (
    <BasicDiv
      width={"full"}
      gap={ctx.rowGap}
      color={props.color}
      fontSize={props.fontSize}
    >
      {ctx.entries.map((entry, entryIndex) => {
        return (
          <BasicDiv
            grid
            width={"full"}
            gap={ctx.columnGap}
            padding={ctx.padding}
            gridCols={ctx.gridCols}
          >
            {ctx.columns.map((col, colIndex) => {
              const colName = getTableColName(col);
              const cellData = entry[colName];
              const isLastCellInTable =
                entryIndex === lastIndex(ctx.entries) &&
                colIndex === lastIndex(ctx.columns);
              const placeholder =
                typeof col === "object" ? col?.placeholder : undefined;

              if (typeof col === "object" && col.weight === "auto") {
                return (
                  <AutoCell
                    data={cellData}
                    placeholder={placeholder}
                    onWidthComputed={(width) => {
                      const maxWidth = columnWidthMap.get(colName);
                      if (!maxWidth || width > maxWidth) {
                        columnWidthMap.set(colName, width);
                      }
                      if (isLastCellInTable) {
                        ctx.onAutoColumnWidthsComputed(columnWidthMap);
                      }
                    }}
                  />
                );
              }

              return (
                <Cell
                  placeholder={placeholder}
                  data={cellData}
                  onRender={() => {
                    if (isLastCellInTable && columnWidthMap.size > 0) {
                      ctx.onAutoColumnWidthsComputed(columnWidthMap);
                    }
                  }}
                />
              );
            })}
          </BasicDiv>
        );
      })}
    </BasicDiv>
  );
}

function AutoCell(props: {
  data: CellProps["data"];
  placeholder?: string;
  onWidthComputed: (width: number) => void;
}) {
  const cellRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (cellRef.current) {
      props.onWidthComputed(
        parseFloat(getComputedStyle(cellRef.current).width)
      );
    } else {
      console.error(
        new Error("Failed to compute style for an Auto cell", {
          cause: { data: props.data, cellRef },
        })
      );
    }
  }, []);

  return (
    <Cell
      data={props.data}
      placeholder={props.placeholder}
      noWrap
      ref={cellRef}
    />
  );
}

interface CellProps {
  data: BasicTableProps.RootProps<string>["entries"][number][string];
  ref?: React.Ref<HTMLElement | null>;
  placeholder?: string;
  noWrap?: boolean;
  onRender?: () => void;
}
function Cell(props: CellProps) {
  useEffect(() => {
    props.onRender?.();
  }, []);

  if (typeof props.data === "string")
    return (
      <BasicSpan
        style={{ whiteSpace: props.noWrap ? "nowrap" : undefined }}
        ref={props.ref}
        children={props.data}
      />
    );
  return props.data ? (
    props.ref ? (
      // The div ref throws an error because of a missing property in props.ref
      //@ts-expect-error
      <div ref={props.ref} style={{ width: "100%", overflow: "hidden" }}>
        {props.data}
      </div>
    ) : (
      props.data
    )
  ) : (
    <BasicSpan
      ref={props.ref}
      fade={0.75}
      width={"full"}
      text={props.placeholder ?? "-"}
    />
  );
}

const BasicTable = {
  Root,
  Header,
  Body,
};

declare namespace BasicTableProps {
  interface RootProps<T extends string>
    extends RootStyles,
      Partial<
        Record<
          "width" | "height" | `${"min" | "max"}${"Height" | "Width"}`,
          BasicHtmlElementStyleProps["width"]
        >
      > {
    columns: (T | TableColumnConfig<T>)[];
    backgroundColor?: BasicColor;
    color?: BasicColor;
    entries: { [Key in T]?: React.ReactElement | string }[];
    /**Applies a columnWeight to columns where: <"column">.weight === undefined */
    columnWeight?: TableColumnConfig["weight"];
    children: [JSX.Element, JSX.Element];
  }

  interface HeaderProps {
    /**@default "left" */
    textAlign?: "left" | "center" | "right";
    /**@default "onSurface[0.1]" */
    separatorColor?: BasicColor | 0 | "none";
    /**@default "camelToLetter" */
    formatColumnName?: "camelToLetter" | ((name: string) => string);
    color?: BasicColor;
    backgroundColor?: BasicColor;
    borderColor?: BasicDivProps["borderColor"];
    fontSize?: BasicDivProps["fontSize"];
    padding?: BasicDivProps["padding"];
    corners?: BasicDivProps["corners"];
  }
  interface BodyProps {
    color?: BasicColor;
    fontSize?: BasicDivProps["fontSize"];
  }
}

export default BasicTable;
export type { BasicTableProps };
