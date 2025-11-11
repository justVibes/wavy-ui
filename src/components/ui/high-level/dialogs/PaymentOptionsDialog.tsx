import {
  BasicDialog,
  BasicDiv,
  BasicSpan,
  FontSize,
  useDialogController,
  UseDialogControllerReturn,
} from "@/main";
import { JSX } from "@emotion/react/jsx-runtime";
import { indexOf } from "@wavy/fn";
import { useState } from "react";
import { IconType } from "react-icons";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { RiBankFill, RiSecurePaymentFill } from "react-icons/ri";

interface PaymentOptionsDialogProps<Variables extends Record<string, any>> {
  triggerElement?: JSX.Element;
  controller?: UseDialogControllerReturn;
  options: {
    icon: IconType;
    label: string;
    description?: string;
    variables?: Variables;
    disabled?: boolean;
    onClick?: (variables: Variables) => void;
    dropDownContent?: string | Record<string, string>;
    "pre-element"?: (variables: Variables) => JSX.Element;
    "post-element"?: (variables: Variables) => JSX.Element;
  }[];
}
function PaymentOptionsDialog(props: PaymentOptionsDialogProps<{}>) {
  const [dropdownVisible, setDropDownVisible] = useState<{ index: number }>();
  const DropDownIcon = dropdownVisible ? FaAngleUp : FaAngleDown;
  const DropDownContent = (props: {
    content: string | Record<string, string>;
  }) => {
    if (!props.content) return;
    if (typeof props.content === "string")
      return <span children={props.content} />;
    return (
      <BasicDiv
        fade={0.75}
        padding={["md", ["left", "right", "bottom"]]}
        fontSize="xs"
      >
        {Object.keys(props.content).map((key) => {
          return (
            <span>
              <strong>{key}:</strong>&nbsp;
              {(props.content as Record<string, string>)[key]}
            </span>
          );
        })}
      </BasicDiv>
    );
  };
  return (
    <BasicDialog.Root
      triggerElement={props.triggerElement}
      controller={props.controller}
      width="22rem"
    >
      <BasicDialog.Header children={"Payment Options"} />
      <BasicDialog.Body gap={"sm"} width="full">
        {props.options.map((option, index) => {
          const PreElements = option.variables
            ? option?.["pre-element"]?.(option.variables)
            : undefined;
          const PostElements = option.variables
            ? option?.["post-element"]?.(option.variables)
            : undefined;

          return (
            <>
              {PreElements}
              <BasicDiv
                width="full"
                css={{
                  backgroundColor:
                    dropdownVisible?.index === index
                      ? "onSurface[0.1]"
                      : undefined,
                }}
                corners={"md"}
                asChildren={!option.dropDownContent}
              >
                <BasicDiv
                  row
                  gap={"md"}
                  width="full"
                  align="center"
                  fade={option.disabled ? 0.5 : 1}
                  cursor={option.disabled ? "not-allowed" : "pointer"}
                  padding={"md"}
                  corners={"md"}
                  css={{
                    transition: "all 300ms linear",
                    ":hover":
                      option.disabled || dropdownVisible?.index === index
                        ? undefined
                        : { backgroundColor: "onSurface[0.1]" },
                  }}
                  onClick={() => {
                    option.onClick?.(option.variables);
                    if (option.dropDownContent)
                      setDropDownVisible(
                        dropdownVisible ? undefined : { index }
                      );
                  }}
                >
                  <option.icon size={"1.5rem"} />
                  <BasicDiv asChildren={!option.description} width="full">
                    <BasicSpan width="full" fontSize="sm" text={option.label} />
                    {option.description && (
                      <span
                        children={option.description}
                        style={{ opacity: 0.75, fontSize: FontSize.xs }}
                      />
                    )}
                  </BasicDiv>
                  {option.dropDownContent && <DropDownIcon />}
                </BasicDiv>
                {option.dropDownContent && dropdownVisible?.index === index && (
                  <DropDownContent content={option.dropDownContent} />
                )}
              </BasicDiv>
              {PostElements}
            </>
          );
        })}
      </BasicDialog.Body>
    </BasicDialog.Root>
  );
}

const definePaymentOption = <Variables extends Record<string, any>>(
  options: PaymentOptionsDialogProps<Variables>["options"][number]
): PaymentOptionsDialogProps<Variables>["options"][number] => {
  return options;
};

const bankTransferPaymentOption = (bankAccount: {
  accountName: string;
  bank: string;
  accountType: "Savings" | "Chequing";
  accountNo: number;
  transitNo: number;
  branch: string;
  transferCurrency: "JMD";
}) => {
  return definePaymentOption({
    icon: RiBankFill,
    label: "Bank Transfer",
    // description: "Make deposits from bank to bank.",
    dropDownContent: {
      "Name On Account": bankAccount.accountName,
      Bank: bankAccount.bank,
      "Account type": bankAccount.accountType,
      "Account #": `${bankAccount.accountNo}`,
      "Transit #": `${bankAccount.transitNo}`,
      Branch: bankAccount.branch,
      "Transfer currency": bankAccount.transferCurrency,
    },
  });
};
const inAppPaymentOption = () => {
  return definePaymentOption({
    icon: RiSecurePaymentFill,
    label: "In App Payment",
    disabled: true,
    variables: {},
  });
};

export default PaymentOptionsDialog;
export { definePaymentOption, bankTransferPaymentOption, inAppPaymentOption };
