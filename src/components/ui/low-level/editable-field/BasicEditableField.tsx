import {
  BasicButton,
  BasicPopover,
  BasicSpan,
  BasicTextField,
  BasicTooltip,
  ellipsis,
  FontSize,
  useManagedRef,
} from "@/main";
import React, { createContext, useContext, useEffect, useState } from "react";
import { IconType } from "react-icons";
import { LuCheck, LuPencilLine, LuX } from "react-icons/lu";
import { BasicButtonProps } from "../html/button/BasicButton";
import BasicDiv, { BasicDivProps } from "../html/div/BasicDiv";
import { BasicPopoverProps } from "../popover/BasicPopover";
import { Prettify, SafeOmit } from "@wavy/types";
import { JSX } from "@emotion/react/jsx-runtime";

const Context = createContext<{
  padding: BasicButtonProps["padding"];
  iconSize: BasicEditableFieldProps["size"];
}>(null);

interface BasicEditableFieldProps {
  value?: string;
  disabled?: boolean;
  label?: string;
  defaultValue?: string;
  /**@default "click" */
  activationMode?: "dblclick" | "click" | "none";
  width?: BasicDivProps["width"];
  /**@default "10rem" */
  inputWidth?: BasicDivProps["width"];
  /**@default "md" */
  size?: "2xl" | "xl" | "lg" | "md" | "sm" | "xs" | "2xs";
  iconSize?: BasicEditableFieldProps["size"];
  /** Prevents editing */
  preventDefault?: boolean;
  /**Replaces the predefined controls */
  control?: JSX.Element;
  placeholder?: string;
  /**The padding for the content in its resting (non-editing) state
   * @default ["md", ["top", "bottom"]] */
  contentPadding?: BasicDivProps["padding"];
  spaceBetween?: boolean;
  hideControls?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  rowGap?: BasicDivProps["gap"];
  columnGap?: BasicDivProps["gap"];
  sanitizePopoverContent?: (value: string) => React.ReactNode;
  onEditClick?: () => void;
  onContentClick?: () => void;
  onCancelClick?: () => void;
  onSaveClick?: (value: string) => void;
  onSave?: (value: string) => void;
  /** @param value The content after it was changed (includes reversions)*/
  onChange?: (value: string) => void;
  /** Invoked when either onEditClick or onContentClick is fired. */
  onEdit?: () => void;
  slotProps?: {
    popover?: Prettify<
      Partial<
        SafeOmit<BasicPopoverProps, "children"> & {
          /**@default "match-anchor" */
          maxWidth: BasicPopoverProps["maxWidth"];
          /**@default "5rem"*/
          maxHeight: BasicPopoverProps["maxHeight"];
        }
      >
    >;
  };
}
function BasicEditableField(props: BasicEditableFieldProps) {
  const clickedControlRef = useManagedRef<"save" | "cancel" | "edit">(null);
  const previousTextRef = useManagedRef(props.defaultValue ?? "");
  const [text, setText] = useState(props.value ?? previousTextRef.read());
  const [editing, setEditing] = useState(false);
  const activationMode = props.activationMode || "click";
  const size = props.size || "md";

  const handleOnChange = (value: string) => {
    if (props.value === undefined) setText(value);
    props.onChange?.(value);
  };

  const rollbackChanges = () => {
    handleOnChange(previousTextRef.read());
  };
  const handleOnEdit = () => {
    props.onEdit?.();
    if (props.preventDefault) return;
    setEditing(true);
  };
  const handleOnCancelClick = () => {
    clickedControlRef.upsert("cancel");
    rollbackChanges();
    props.onCancelClick?.();
    setEditing(false);
  };
  const handleTextFieldBlur = (e: { preventDefault: VoidFunction }) => {
    e.preventDefault();
    const clickedControl = clickedControlRef.read();

    if (clickedControl !== "save") rollbackChanges();
    setEditing(false);
  };
  const handleOnSave = (isClick = true) => {
    previousTextRef.upsert(text);
    if (isClick) {
      clickedControlRef.upsert("save");
      props.onSaveClick?.(text);
    }
    props.onSave?.(text);
    setEditing(false);
  };
  const handleOnEditClick = () => {
    clickedControlRef.upsert("edit");
    props.onEditClick?.();
    handleOnEdit();
  };
  const handleOnEnterPressed = () => {
    handleOnSave(false);
  };
  const handleOnContentClick = () => {
    props.onContentClick?.();
    handleOnEdit();
  };

  const wrapperProps: BasicDivProps = {
    align: "center",
    gap: props.rowGap ?? "sm",
    width: props.width,
    maxWidth: "full",
  };
  return (
    <Context.Provider
      value={{
        padding: ".25rem",
        iconSize: props.iconSize || size,
      }}
    >
      <BasicDiv
        {...wrapperProps}
        asChildren={!props.label}
        row={false}
        align="start"
      >
        {props.label && (
          <BasicSpan
            text={props.label}
            fontSize={FontSize[size]}
            fade={editing ? 0.75 : 0.5}
            style={{ transition: "all 200ms linear" }}
          />
        )}
        <BasicDiv
          {...wrapperProps}
          grid
          gap={props.columnGap ?? wrapperProps.gap}
          gridCols={
            props.hideControls
              ? "1fr"
              : props.control
              ? "1fr auto"
              : editing // The conditions are "spelt out" for readability
              ? "1fr auto auto"
              : "1fr auto"
          }
          justify={props.spaceBetween ? "space-between" : undefined}
        >
          {editing ? (
            <BasicDiv width={"full"} align="center" gap={"md"}>
              <BasicTextField
                autoFocus
                size={size}
                value={text}
                corners={"md"}
                pureRef={props.inputRef}
                width={props.inputWidth}
                placeholder={props.placeholder}
                onEnterKeyPressed={handleOnEnterPressed}
                onBlur={handleTextFieldBlur}
                onChange={handleOnChange}
              />
            </BasicDiv>
          ) : (
            <BasicDiv
              spill={"hidden"}
              width={"full"}
              padding={props.contentPadding ?? ["md", ["top", "bottom"]]}
              corners={"sm"}
              fontSize={size}
              cursor="text"
              css={{
                transition: "all 200ms linear",
                ":hover": {
                  backgroundColor: "onSurface[0.1]",
                },
              }}
              onDoubleClick={
                activationMode === "dblclick" ? handleOnCancelClick : undefined
              }
              onClick={
                activationMode === "click" ? handleOnContentClick : undefined
              }
            >
              <BasicPopover
                {...props.slotProps?.popover}
                allowInteractions
                asChild={props.slotProps?.popover.asChild ?? !text}
                content={
                  (props.slotProps?.popover.content ||
                    props.sanitizePopoverContent?.(text)) ??
                  text
                }
                displayAction="hover"
                maxWidth={props.slotProps?.popover.maxWidth || "10rem"}
                maxHeight={props.slotProps?.popover.maxHeight || "5rem"}
              >
                <span
                  style={ellipsis({
                    opacity: props.placeholder && !text ? 0.85 : 1,
                    width: "100%",
                  })}
                >
                  {text || props.placeholder}
                </span>
              </BasicPopover>
            </BasicDiv>
          )}
          {!props.hideControls &&
            (props.control || (
              <ControlButtons
                editing={editing}
                onCancel={handleOnCancelClick}
                onSave={handleOnSave}
                onEdit={handleOnEditClick}
              />
            ))}
        </BasicDiv>
      </BasicDiv>
    </Context.Provider>
  );
}

function ControlButtons(props: {
  editing: boolean;
  onCancel: () => void;
  onSave: () => void;
  onEdit: () => void;
}) {
  if (!props.editing) {
    return <Control icon={LuPencilLine} onClick={props.onEdit} />;
  }
  return (
    <>
      <Control outlined icon={LuX} onClick={props.onCancel} />
      <Control preventDefault outlined icon={LuCheck} onClick={props.onSave} />
    </>
  );
}

function Control(props: {
  icon: IconType;
  outlined?: boolean;
  preventDefault?: boolean;
  onClick: () => void;
}) {
  const { padding, iconSize } = useContext(Context);

  return (
    <BasicDiv
      asChildren={props.outlined}
      corners={"sm"}
      css={{
        transition: "all 200ms linear",
        ":hover": {
          backgroundColor: "onSurface[0.1]",
        },
      }}
    >
      <BasicButton
        size={iconSize}
        padding={padding}
        leadingEl={props.icon}
        backgroundColor={"transparent"}
        borderColor={props.outlined ? "onSurface[0.25]" : undefined}
        onClick={props.onClick}
        aspectRatio={1}
        color="onSurface"
        corners={"sm"}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      />
    </BasicDiv>
  );
}

export default BasicEditableField;
