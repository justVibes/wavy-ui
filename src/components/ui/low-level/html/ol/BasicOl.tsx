import { BasicDiv, BasicSpan, ColorResources, CssColors } from "@/main";

import { IoMdCheckmark } from "react-icons/io";
import { BasicDivProps } from "../div/BasicDiv";

interface BasicOlProps<Item extends string> extends ListItemStyleProps {
  height?: BasicDivProps["height"];
  width?: BasicDivProps["width"];
  /**
   * @default "md"
   */
  gap?: BasicDivProps["gap"];
  bold?: boolean;
  items: (Item | { label: string; nestedItems: Item[] })[];
  isItemActive: (item: Item) => boolean;
  isItemCompleted: (item: Item) => boolean;
  onItemClick?: (item: Item) => void;
}
function BasicOl<Item extends string>(props: BasicOlProps<Item>) {
  const handleOnItemClick = (item: string) => props.onItemClick?.(item as Item);

  const isBold =
    props.bold ?? props.items.some((item) => typeof item === "object");
  return (
    <BasicDiv gap={props.gap || "md"} width={props.width} height={props.height}>
      {props.items.map((item, i) => {
        if (typeof item === "string")
          return (
            <ListItem
              key={item}
              index={i}
              item={item}
              bold={isBold}
              active={props.isItemActive(item)}
              completed={props.isItemCompleted(item)}
              onClick={handleOnItemClick}
            />
          );

        return (
          <BasicDiv width="full" key={item.label}>
            <ListItem
              index={i}
              bold={isBold}
              item={item.label}
              active={item.nestedItems.some((item) => props.isItemActive(item))}
              completed={item.nestedItems.every((item) =>
                props.isItemCompleted(item)
              )}
              onClick={
                item.nestedItems?.[0]
                  ? () => handleOnItemClick(item.nestedItems[0])
                  : undefined
              }
            />
            <BasicDiv width="full">
              {item.nestedItems.map((nestedItem, i) => (
                <ListItem
                  index={i}
                  key={nestedItem}
                  fontSize="sm"
                  nested
                  item={nestedItem}
                  active={props.isItemActive(nestedItem)}
                  completed={props.isItemCompleted(nestedItem)}
                  onClick={handleOnItemClick}
                />
              ))}
            </BasicDiv>
          </BasicDiv>
        );
      })}
    </BasicDiv>
  );
}

interface ListItemStyleProps {
  fontSize?: BasicDivProps["fontSize"];
}
interface ListItemProps extends ListItemStyleProps {
  index: number;
  active: boolean;
  completed: boolean;
  item: string;
  bold?: boolean;
  nested?: boolean;
  onClick?: (item: string) => void;
}

function ListItem(props: ListItemProps) {
  const onCompletedColor = ColorResources.white;
  const hoverColor = CssColors.onSurface;
  const activeColor = props.nested ? hoverColor : CssColors.tertiaryContainer;
  const completedColor = props.active
    ? activeColor
    : ColorResources.carlsbergGreen;
  const completedTextColor =
    props.active && !props.nested ? activeColor : CssColors["onSurface[0.25]"];
  const inactiveTextColor = props.nested
    ? CssColors["onSurface[0.4]"]
    : CssColors["onSurface[0.5]"];
  const inactiveBorderColor = CssColors["onSurface[0.2]"];

  const handleOnClick = () => props.onClick?.(props.item);

  const Checkmark = IoMdCheckmark;
  return (
    <BasicDiv
      row
      gap="md"
      clickable
      width="full"
      fontSize={props.fontSize || "md"}
      align="center"
      onClick={handleOnClick}
      css={{
        transition: "all 300ms linear",
        color:
          props.completed && !(props.nested && props.active)
            ? completedTextColor
            : props.active
            ? activeColor
            : inactiveTextColor,
        borderColor: props.completed
          ? completedColor
          : props.active
          ? activeColor
          : inactiveBorderColor,
        ":hover": props.active
          ? undefined
          : {
              color: hoverColor,
              borderColor:
                props.completed && !props.nested ? undefined : hoverColor,
            },
      }}
    >
      <BasicDiv
        corners={"circle"}
        centerContent
        size={"1.5rem"}
        style={{ textAlign: "center", flexShrink: 0 }}
        borderColor={"inherit"}
        backgroundColor={props.completed ? completedColor : undefined}
        color={props.completed ? onCompletedColor : "inherit"}
        fade={props.nested ? 0 : 1}
        padding={props.completed ? undefined : "md"}
      >
        {props.completed ? (
          <Checkmark fontSize={"1rem"} />
        ) : (
          <BasicSpan
            fontWeight="bold"
            textAlign="center"
            centerContent
            text={`${props.index + 1}`}
            style={{ lineHeight: "0" }}
          />
        )}
      </BasicDiv>
      <span
        style={{
          width: "100%",
          fontWeight: props.bold ? "bold" : undefined,
          opacity:
            props.completed && !props.active ? (props.nested ? 0.5 : 0.75) : 1,
        }}
      >
        {props.item}
      </span>

      {props.completed && props.nested && (
        <Checkmark size={"1.25rem"} opacity={0.75} />
      )}
    </BasicDiv>
  );
}

export default BasicOl;
export type { BasicOlProps };
