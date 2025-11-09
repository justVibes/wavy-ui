import {
  BasicColor,
  BasicDialog,
  CancelButton,
  UseDialogControllerReturn,
  useManagedRef,
} from "@/main";
import { JSX } from "@emotion/react/jsx-runtime";
import { BasicButtonProps } from "../../low-level/html/button/BasicButton";
import { BasicSpanProps } from "../../low-level/html/span/BasicSpan";
import DoneButton from "../buttons/DoneButton";
import Calendar, { CalendarProps } from "../calendar/Calendar";

interface CalendarDialogProps extends CalendarProps {
  title?: string;
  titleFontSize?: BasicSpanProps["fontSize"];
  controller?: UseDialogControllerReturn;
  triggerElement?: JSX.Element;
  /**@default "onSurface[0.1]" */
  backgroundColor?: BasicColor;
  /**@default ".5rem" */
  backdropBlur?: string;
  /**@default "xs" */
  actionButtonSize?: BasicButtonProps["size"];
  onDoneClick?: (date: Date) => void;
  onOpenChange?: (isOpen: boolean) => void;
}
function CalendarDialog(props: CalendarDialogProps) {
  // const { triggerRerender } = useRerender();
  const dateRef = useManagedRef<Date>(null);
  const { controller, triggerElement, backdropBlur, backgroundColor, ...rest } =
      props,
    actionButtonSize = props.actionButtonSize || "xs";

  // useEffect(() => {
  //   console.log({
  //     propsSelected: props.selectedDate,
  //     ref: dateRef.read()?.toDateString(),
  //   });
  // });

  const handleOnDateClick = (date: Date) => {
    dateRef.upsert(date);
    props.onDateSelected?.(date);
  };
  const handleDoneClick = () => {
    props.onDoneClick?.(dateRef.read());
  };
  const handleOnOpenChange = (isOpen: boolean) => {
    // triggerRerender();
    props.onOpenChange?.(isOpen);
  };

  return (
    <BasicDialog
      hideCloseButton
      onOpenChange={handleOnOpenChange}
      width={"max-content"}
      controller={controller}
      triggerElement={triggerElement}
      backgroundColor={backgroundColor || "onSurface[0.25]"}
      backdropBlur={backdropBlur || ".5rem"}
    >
      {props.title && (
        <BasicDialog.Header fontSize={props.titleFontSize}>
          {props.title}
        </BasicDialog.Header>
      )}
      <BasicDialog.Body>
        <Calendar
          {...rest}
          selectedDate={props.selectedDate || dateRef.read()}
          onDateSelected={handleOnDateClick}
        />
      </BasicDialog.Body>
      <BasicDialog.Footer>
        <BasicDialog.ActionTrigger>
          <CancelButton size={actionButtonSize} fade={0.5} />
        </BasicDialog.ActionTrigger>
        <BasicDialog.ActionTrigger>
          <DoneButton size={actionButtonSize} onClick={handleDoneClick} />
        </BasicDialog.ActionTrigger>
      </BasicDialog.Footer>
    </BasicDialog>
  );
}

export default CalendarDialog;
