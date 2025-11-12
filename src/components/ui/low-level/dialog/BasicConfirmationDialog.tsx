import React, { useRef } from "react";
import BasicDialog from "./BasicDialog";
import {
  BasicButton,
  BasicDisclaimer,
  resolveBasicColor,
  UseDialogControllerReturn,
} from "@/main";
import { JSX } from "@emotion/react/jsx-runtime";
import CancelButton from "../../high-level/buttons/CancelButton";
import { BasicDivProps } from "../html/div/BasicDiv";
import { TaskResult } from "@wavy/types";

interface BasicConfirmationDialogProps
  extends Partial<
    Record<
      "width" | "height" | `${"min" | "max"}${"Width" | "Height"}`,
      BasicDivProps["width"]
    >
  > {
  title: string;
  message: string;
  hideDisclaimerLabel?: boolean;
  disclaimer?: string;
  controller?: UseDialogControllerReturn;
  triggerElement?: JSX.Element;
  /**
   * @default "error"
   */
  severity?: "error" | "info" | "warning";
  /**
   * @default "Cancel"
   */
  cancelLabel?: "Dismiss" | "Cancel" | (string & {});
  onCancelClick?: () => void;
  action: {
    label: string;
    onClick: () => void | Promise<TaskResult> | TaskResult;
  };
}

function BasicConfirmationDialog(props: BasicConfirmationDialogProps) {
  const severity = props.severity || "error";
  const color = resolveBasicColor(severity, {
    preference: "res",
  });
  
  return (
    <BasicDialog.Root
      controller={props.controller}
      width={props.width ?? "25rem"}
      height={props.height}
      minHeight={props.minHeight}
      maxHeight={props.maxHeight}
      minWidth={props.minWidth}
      maxWidth={props.maxWidth}
      triggerElement={props.triggerElement}
    >
      <BasicDialog.Header fontSize="2xl">{props.title}</BasicDialog.Header>
      <BasicDialog.Body fade={0.75}>
        <span>{props.message}</span>
        {props.disclaimer && (
          <BasicDisclaimer
            width={"full"}
            facade={(s) => (s === "error" ? "warning" : s)}
            hideLabel={props.hideDisclaimerLabel}
            severity={severity}
            message={props.disclaimer}
          />
        )}
      </BasicDialog.Body>
      <BasicDialog.Footer gap={"md"}>
        <BasicDialog.ActionTrigger>
          <BasicButton
            size="sm"
            fade={0.75}
            color="onSurface"
            backgroundColor="transparent"
            text={props.cancelLabel || "Cancel"}
            onClick={props.onCancelClick}
          />
        </BasicDialog.ActionTrigger>
        <BasicButton
          async
          size="sm"
          text={props.action.label}
          backgroundColor={color}
          color="white"
          onClick={props.action.onClick}
        />
      </BasicDialog.Footer>
    </BasicDialog.Root>
  );
}

export default BasicConfirmationDialog;
