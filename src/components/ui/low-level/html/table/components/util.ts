import { BasicTableProps } from "../BasicTable";

const getTableGridCols = (
  columns: BasicTableProps.RootProps<string>["columns"],
  defaultWeight:string
) => {
  return columns
    .map((col) => (typeof col === "string" || !col.weight ? defaultWeight : col.weight))
    .join(" ");
};
const getTableColName = (
  column: BasicTableProps.RootProps<string>["columns"][number]
) => {
  return typeof column === "string" ? column : column.name;
};

export { getTableColName, getTableGridCols };

