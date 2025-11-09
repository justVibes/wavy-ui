import { createContext, memo, useContext, useState } from "react";

import { BasicDiv, useManagedRef } from "@/main";
import { inRange, range } from "@wavy/fn";
import DatePicker, { ReactDatePickerCustomHeaderProps } from "react-datepicker";
import {
  IoChevronBack,
  IoChevronDown,
  IoChevronForward,
} from "react-icons/io5";
import BasicSelect from "../../low-level/html/select/BasicSelect";
import "react-datepicker/dist/react-datepicker.css";
import "./assets/styles.css";

type DateType = number | Date | (string & {});

interface CalendarProps {
  /**@default "Jan 1, 1920"*/
  minDate?: DateType;
  /**@default "end-of-year" */
  maxDate?: DateType | "today" | "end-of-year";
  /**@default "after" */
  navLayout?: "after" | "around";
  formId?: string;
  selectedDate?: Date;
  allowSameDay?: boolean;
  required?: boolean;
  onDateSelected?: (date: Date) => void;
  onClose?: () => void;
}

function Calendar(props: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState(
    props.selectedDate || new Date()
  );
  const state = useManagedRef(selectedDate);
  const minDate = toDate(props.minDate) || new Date("Jan 1, 1920"),
    maxDate =
      props.maxDate === "today"
        ? new Date()
        : !props.maxDate || props.maxDate === "end-of-year"
        ? getEndOfYearDate()
        : toDate(props.maxDate);

  const handleOnChange = (date: Date) => {
    setSelectedDate(date);
    props.onDateSelected?.(date);
  };
  const isDateSelected = (date: Date) =>
    date.toDateString() === selectedDate.toDateString();
  const isDateToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();
  const isDateInActiveMonth = (date: Date) => {
    const activeState = state.read();
    return (
      activeState.getMonth() === date.getMonth() &&
      getDaysInMonth(
        activeState.getMonth(),
        activeState.getFullYear()
      ).includes(date.getDate())
    );
  };

  const handleStateChange = (date: Date) => state.upsert(date);
  return (
    <DatePicker
      inline
      required
      allowSameDay={props.allowSameDay}
      minDate={minDate}
      maxDate={maxDate}
      onMonthChange={handleStateChange}
      onYearChange={handleStateChange}
      renderCustomHeader={(props) => (
        <Header {...props} minDate={minDate} maxDate={maxDate} />
      )}
      form={props.formId}
      selected={selectedDate}
      onChange={handleOnChange}
      calendarClassName="calendar"
      weekDayClassName={() => "calendar-week-day"}
      dayClassName={(date) =>
        [
          "calendar-date",
          isDateSelected(date) ? "selected" : "unselected",
          isDateToday(date) ? "today" : "",
          !isDateInActiveMonth(date) ? "out-of-bounds" : "",
        ].join(" ")
      }
    />
  );
}

function Header(
  props: ReactDatePickerCustomHeaderProps & { minDate: Date; maxDate: Date }
) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ].filter(
    (_, i) => {
      const currentYear = props.date.getFullYear();
      if (currentYear === props.minDate.getFullYear()) {
        return i >= props.minDate.getMonth();
      }
      if (currentYear === props.maxDate.getFullYear()) {
        return i <= props.maxDate.getMonth();
      }

      return true;
    }
  );
  const selectedMonth = months[props.date.getMonth()];

  props.visibleYearsRange;
  const handleMonthClick = (value: string) => {
    props.changeMonth(months.findIndex((m) => m === value));
  };
  const handleYearClick = (value: string) => {
    props.changeYear(parseInt(value));
  };

  const getYears = () => {
    // We add one to the max year because the range doesn't include the last number
    return range(props.minDate.getFullYear(), props.maxDate.getFullYear() + 1);
  };
  const getNavClassName = (disabled: boolean) => {
    return ["calendar-chevron", "nav", disabled ? "disabled" : ""].join(" ");
  };

  return (
    <BasicDiv
      width={"full"}
      row
      align="center"
      justify="space-between"
      padding={["md", "bottom"]}
    >
      <IoChevronBack
        className={getNavClassName(props.prevMonthButtonDisabled)}
        onClick={
          props.prevMonthButtonDisabled ? undefined : props.decreaseMonth
        }
      />
      <BasicDiv row align="center" gap={"md"}>
        <Dropdown
          label={selectedMonth}
          isSelected={(value) => selectedMonth === value}
          options={months.map((month) => ({
            value: month,
          }))}
          onOptionClick={handleMonthClick}
        />
        <Dropdown
          label={`${props.date.getFullYear()}`}
          isSelected={(value) => `${props.date.getFullYear()}` === value}
          options={getYears()
            .map((y) => ({ value: y.toString() }))
            .toReversed()}
          onOptionClick={handleYearClick}
        />
      </BasicDiv>

      <IoChevronForward
        className={getNavClassName(props.nextMonthButtonDisabled)}
        onClick={
          props.nextMonthButtonDisabled ? undefined : props.increaseMonth
        }
      />
    </BasicDiv>
  );
}

function Dropdown(props: {
  label: string;
  isSelected: (option: string) => boolean;
  options: { value: string; disabled?: boolean }[];
  onOptionClick: (option: string) => void;
}) {
  return (
    <BasicSelect
      isSelected={({ value }) => props.isSelected(value)}
      onOptionClick={({ value }) => props.onOptionClick(value)}
      options={props.options}
      maxHeight={"10rem"}
    >
      <div
        style={{
          display: "inline-flex",
          gap: ".25rem",
          alignItems: "center",
          cursor: "pointer",
          borderRadius: ".5rem",
          fontSize: "1.1rem",
          fontWeight: "bold",
        }}
      >
        <span style={{}}>{props.label}</span>

        <IoChevronDown className="calendar-chevron" />
      </div>
    </BasicSelect>
  );
}

const toDate = (date: CalendarProps["maxDate"]) => {
  if (!date) return;
  if (date instanceof Date) return date;
  return new Date(date);
};

const getDaysInMonth = (month: number, year: number) => {
  const date = new Date(year, month, 1);
  const days: number[] = [];
  while (date.getMonth() === month) {
    const day = date.getDate();
    days.push(day);
    date.setDate(day + 1);
  }
  return days;
};

const getEndOfYearDate = () => {
  const date = new Date();
  date.setMonth(11);
  date.setDate(31);
  return date;
};

export default memo(Calendar);
export type { CalendarProps };
