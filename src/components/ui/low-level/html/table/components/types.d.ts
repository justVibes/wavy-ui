type TableColumnConfig<T extends string = string> = {
  name: T;
  /**@default "1fr" */
  weight?: "auto" | `${number}${"rem" | "fr" | "px"}`;
  backgroundColor?: BasicColor;
  color?: BasicColor;
  /**The value that should be used if a cell doesn't have any data. */
  placeholder?: string;
};

export type { TableColumnConfig };
