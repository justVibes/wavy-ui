import {
  BasicColor,
  CopyButton,
  CssSpacing,
  PasteButton,
  resolveBasicColor,
  useManagedRef,
} from "@/main";
import {
  Field,
  Input,
  InputAddonProps,
  InputElementProps,
  InputGroup,
  InputProps,
} from "@chakra-ui/react";
import { JSX } from "@emotion/react/jsx-runtime";
import { takeLast } from "@wavy/fn";
import { useEffect, useRef } from "react";
import applyBasicStyle, { HtmlElementDim } from "../html/BasicStyle";
import BasicDiv, { BasicDivProps } from "../html/div/BasicDiv";
import { isCharAllowed } from "./helper-functions/BasicTextFieldHelperFunctions";
import { AllowedCharacters } from "./types/BasicTextFieldTypes";
import { Prettify } from "@wavy/types";

type ElementPos = "leading" | "trailing";
type ElementType = "Adornment" | "Content";
type AdditionalElements = {
  [Key in `${ElementPos}${ElementType}`]?: React.ReactNode;
};

interface BasicTextFieldProps extends AdditionalElements {
  disabled?: boolean;
  readOnly?: boolean;
  borderColor?: BasicDivProps["borderColor"];
  backgroundColor?: BasicColor;
  color?: BasicColor;
  focusColor?: BasicColor;
  /**
   * @default "all"
   */
  allowedChars?: AllowedCharacters | AllowedCharacters[];
  /**
   * @default "none"
   */
  format?: "currency" | "none";
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  allowPasteText?: boolean;
  allowCopyText?: boolean;
  label?: string;
  required?: boolean;
  helperText?: string;
  indent?: HtmlElementDim | Partial<Record<"left" | "right", HtmlElementDim>>;
  onPasteClick?: (text: string) => void;
  width?: BasicDivProps["width"];
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  autoFocus?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  pureRef?: React.Ref<HTMLInputElement>;
  /**
   * @default "outline"
   */
  variant?: InputProps["variant"];
  /**
   * @default "md"
   */
  size?: InputProps["size"];
  /**
   * @default "0.75rem"
   */
  corners?: BasicDivProps["corners"];
  slotProps?: Prettify<
    Partial<
      { [Key in `${ElementPos}Adornment`]: InputAddonProps } & {
        [Key in `${ElementPos}Content`]: InputElementProps;
      } & {
        placeholder: Partial<{ color: BasicColor }>;
      } & ClipboardHelperWrapperProps["slotProps"] &
        Record<
          "helperText" | "label",
          Partial<{
            fontSize: BasicDivProps["fontSize"];
            fade: number;
            fontWeight: BasicDivProps["fontWeight"];
          }>
        >
    >
  >;

  onEnterKeyPressed?: () => void;
  onChange?: (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}
function BasicTextField(props: BasicTextFieldProps) {
  const textRef = useManagedRef(props.defaultValue);
  const controlled = props.value !== undefined;
  const inputRef = props.ref || useRef<HTMLInputElement>(null);

  const defaultIndent = "2rem";
  const getSideIndent = (side: "left" | "right") =>
    typeof props.indent === "string" ? props.indent : props.indent?.[side];

  const padding = "md";

  const { size, ...rest } = props;

  const styles = {
    label: applyBasicStyle({
      ...props?.slotProps?.label,
      fade: props?.slotProps?.label?.fade || 0.75,
    }),
    helperText: applyBasicStyle({
      ...props?.slotProps?.helperText,
    }),
    root: applyBasicStyle({ width: props.width }),
    input: applyBasicStyle({
      ...rest,
      width: "full",
      padding: {
        top: padding,
        left: props.leadingContent
          ? getSideIndent("left") || defaultIndent
          : padding,
        right: props.trailingContent
          ? getSideIndent("right") || defaultIndent
          : padding,
        bottom: padding,
      },
      corners: !props.corners && props.corners !== 0 ? ".75rem" : props.corners,
    }),
  };

  const manuallyUpdateInput = (value: string) => {
    inputRef.current.value = value;
    props.onChange(value, null);
  };

  useEffect(() => {
    const handleFormatText = (text: string) => {
      if (props.format !== "currency") return;

      let value = text;
      // Remove non-numeric characters except for the decimal point
      value = value
        .replace(/[^0-9.]/g, "") // Remove all chars that aren't a number or a decimal point.
        .replace(/\.{2,}/, "") // Remove consecutive decimal points
        .split(".")
        .filter((_, i) => i < 2)
        .join(".");

      if (
        value &&
        takeLast(value.split(""))[0] !== "." // Skip format if the last char is a decimal point
      ) {
        const numberValue = parseFloat(value);
        if (!isNaN(numberValue)) {
          const formatter = new Intl.NumberFormat();

          manuallyUpdateInput(formatter.format(numberValue));
        }
      }
    };

    // Handle allowed characters
    inputRef.current?.addEventListener?.("beforeinput", (e) => {
      const char = e.data;
      const allowedChars: AllowedCharacters | AllowedCharacters[] =
        props.format === "currency" ? /[0-9.]/ : props.allowedChars || "all";

      if (
        allowedChars === "all" ||
        (Array.isArray(allowedChars) && allowedChars.includes("all")) ||
        char === null
      ) {
        return;
      }

      if (
        (!Array.isArray(allowedChars) && !isCharAllowed(char, allowedChars)) ||
        (Array.isArray(allowedChars) &&
          allowedChars.some((allowedChar) => !isCharAllowed(char, allowedChar)))
      ) {
        e.preventDefault();
      }
    });

    // Format input on change
    inputRef.current?.addEventListener?.("paste", (e) => {
      //@ts-expect-error
      handleFormatText(e.target.value);
    });
    inputRef.current?.addEventListener?.("input", (e) => {
      //@ts-expect-error
      handleFormatText(e.target.value);
    });
  }, [inputRef.current]);

  const handleOnPaste = (text: string) => {
    props.onChange?.(text, undefined);
    props.onPasteClick?.(text);
  };

  return (
    <Field.Root
      required={props.required}
      disabled={props.disabled}
      // opacity={}
      // width={props.width}
      style={styles.root}
    >
      {props.label && (
        <Field.Label style={styles.label}>
          {props.label} <Field.RequiredIndicator />
        </Field.Label>
      )}

      <ClipboardHelperWrapper
        elementRef={inputRef}
        useCopy={props.allowCopyText}
        usePaste={props.allowPasteText}
        onPaste={handleOnPaste}
        slotProps={props.slotProps}
      >
        <InputGroup
          startElement={props.leadingContent}
          startElementProps={
            props.slotProps?.leadingContent || { padding: "2" }
          }
          endElement={props.trailingContent}
          endElementProps={props.slotProps?.trailingContent || { padding: "1" }}
          startAddon={props.leadingAdornment}
          startAddonProps={{
            ...props.slotProps?.leadingAdornment,
            padding: props.slotProps?.leadingAdornment?.padding || "1",
            borderRadius: "xl",
          }}
          endAddon={props.trailingAdornment}
          endAddonProps={{
            ...props.slotProps?.trailingAdornment,
            padding: props.slotProps?.trailingAdornment?.padding || "1",
            borderRadius: "xl",
          }}
          gapX={".5rem"}
        >
          <Input
            readOnly={props.readOnly}
            ref={props.pureRef || inputRef}
            width={"full"}
            autoFocus={props.autoFocus}
            size={size}
            zIndex={1}
            variant={props.variant}
            onKeyDown={(e) => {
              if (e.key === "Enter") props.onEnterKeyPressed?.();
            }}
            // pattern="^\s*(\$|€|£|¥)?\s*(-)?\s*(\d{1,3}(?:,\d{3})*|\d+)(\.\d{2})?\s*$"
            // css={{ "&:invalid": { color: "red" } }}
            defaultValue={textRef.read()}
            value={props.value}
            overflow={"hidden"}
            style={styles.input}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            css={{
              "--focus-color": resolveBasicColor(props.focusColor || "primary"),
            }}
            _placeholder={
              props.slotProps?.placeholder?.color
                ? {
                    color: resolveBasicColor(props.slotProps.placeholder.color),
                  }
                : undefined
            }
            onChange={(e) => {
              const value = e.currentTarget.value;

              textRef.upsert(value);
              //   setText(value);
              props.onChange?.(value, e);
            }}
            placeholder={props.placeholder}
          />
        </InputGroup>
        {/* </UiAddonWrapper> */}
      </ClipboardHelperWrapper>

      {props.helperText && (
        <Field.HelperText style={styles.helperText}>
          {props.helperText}
        </Field.HelperText>
      )}
    </Field.Root>
  );
}

interface ClipboardHelperWrapperProps {
  useCopy?: boolean;
  usePaste?: boolean;
  children: JSX.Element;
  elementRef: React.RefObject<HTMLInputElement | null>;
  slotProps?: Partial<{
    pasteButton: Partial<{ iconOnly: boolean }>;
    copyButton: Partial<{ iconOnly: boolean }>;
  }>;
  onPaste?: (text: string) => void;
}
function ClipboardHelperWrapper(props: ClipboardHelperWrapperProps) {
  if (!props.useCopy && !props.usePaste) return props.children;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: CssSpacing.sm,
        width: "100%",
      }}
    >
      {props.children}
      {props.useCopy && (
        <CopyButton
          iconOnly={props.slotProps?.copyButton?.iconOnly}
          inputRef={props.elementRef}
        />
      )}
      {props.usePaste && (
        <PasteButton
          iconOnly={props.slotProps?.pasteButton?.iconOnly}
          inputRef={props.elementRef}
          onClick={props.onPaste}
        />
      )}
    </div>
  );
}

export default BasicTextField;
export type { BasicTextFieldProps };
