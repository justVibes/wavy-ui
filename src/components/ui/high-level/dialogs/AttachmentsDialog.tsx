import { imageResolver } from "@/image-resolver/imageResolver";
import {
  BasicCard,
  BasicDialog,
  BasicDiv,
  BasicImg,
  BasicSpan,
  DeleteButton,
  EmptyState,
  getFileIcon,
  OpenButton,
  SearchTextField,
  UploadButton,
  UseDialogControllerReturn,
  useManagedRef,
  useRerender,
} from "@/main";
import { format, isEmpty, sanitizeLocalFile } from "@wavy/fn";
import type {
  Email,
  KnownFileTypeAlias,
  LocalFile,
  Prettify,
} from "@wavy/types";
import { createContext, JSX, useContext, useEffect, useState } from "react";

type Attachment = Email["attachments"][number];
type ContextType = Prettify<
  Partial<
    Record<
      `onAttachment${"Added" | "Deleted"}`,
      (attachement: Attachment) => void
    >
  > &
    Partial<
      Record<
        `${"delete" | "open"}Disabled`,
        boolean | ((attachment: Attachment) => boolean)
      >
    > & {
      attachments: Email["attachments"];
      onOpenAttachment?: (attachment: Attachment) => void;
      attachmentsEventListener?: (
        event: "open" | "delete" | "add",
        attachement: Attachment
      ) => void;
      uploadDisabled?: boolean;
      hideDeleteButton?: boolean;
      hideOpenAttachmentButton?: boolean;
      hideUploadButton?: boolean;
      getFilePath?: (file: File) => string;
      accepts?: KnownFileTypeAlias | KnownFileTypeAlias[];
    }
>;

const MainContext = createContext<ContextType & { rerender: () => void }>(null);

interface AttachmentsDialogProps extends ContextType {
  readOnly?: boolean;
  triggerElement?: JSX.Element;
  unmountOnExit?: boolean;
  rerenderOnClose?: boolean;
  controller?: UseDialogControllerReturn;
  onAttachmentsChange?: (attachments: Email["attachments"]) => void;
  onClose?: () => void;
}

function AttachmentsDialog(props: AttachmentsDialogProps) {
  const attachmentsRef = useManagedRef(props.attachments || []);
  const { triggerRerender } = useRerender();

  const handleOnClose = () => {
    props.onClose?.();
    if (props.rerenderOnClose) triggerRerender();
  };
  return (
    <MainContext.Provider
      value={{
        ...props,
        attachmentsEventListener: (event, attachment) => {
          let attachments = attachmentsRef.read();
          if (event === "add") attachments = [...attachments, attachment];
          if (event === "delete") {
            attachments = attachments.filter(
              ({ uid }) => uid !== attachment.uid
            );
          }

          attachmentsRef.upsert(attachments);
          props.onAttachmentsChange?.(attachments);
          if (event === "delete" && isEmpty(attachments)) triggerRerender();

          props.attachmentsEventListener?.(event, attachment);
        },
        attachments: attachmentsRef.read(),
        rerender: triggerRerender,
      }}
    >
      <BasicDialog.Root
        onClose={handleOnClose}
        unmountOnExit={props.unmountOnExit}
        maxHeight={"30rem"}
        width={"27rem"}
        scrollBehavior={"inside"}
        triggerElement={props.triggerElement}
        controller={props.controller}
        spill={"hidden"}
      >
        <BasicDialog.Header style={{ flexShrink: 0 }} fontSize="xxl">
          Attachments
        </BasicDialog.Header>
        <BasicDialog.Body size={"full"} padding={"sm"} spill={"hidden"}>
          {isEmpty(attachmentsRef.read()) ? (
            <AttachmentsNotFound />
          ) : (
            <AttachmentsList />
          )}
        </BasicDialog.Body>
      </BasicDialog.Root>
    </MainContext.Provider>
  );
}

function AttachmentsList() {
  const mainCtx = useContext(MainContext);
  const initialRenderRef = useManagedRef<boolean>(undefined);

  const [query, setQuery] = useState("");
  const [attachments, setAttachments] = useState(mainCtx?.attachments || []);

  useEffect(() => {
    initialRenderRef.upsert(true);
  }, []);
  useEffect(() => {
    if (initialRenderRef.read() === true) initialRenderRef.upsert(false);
  });

  const filteredAttachments = query.trim()
    ? attachments.filter(({ name: filename }) =>
        filename.toLowerCase().includes(query.toLowerCase())
      )
    : attachments;
  const queryNotFound = isEmpty(filteredAttachments) && !!query.trim();

  const handleOnDelete = (attachment: Attachment) => {
    setAttachments((attchs) =>
      attchs.filter(({ uid }) => uid !== attachment.uid)
    );
    mainCtx?.onAttachmentDeleted?.(attachment);
    mainCtx?.attachmentsEventListener?.("delete", attachment);
  };
  const handleOnUpload = (_: File[], files: LocalFile[]) => {
    const sanitizedFile = sanitizeLocalFile(files[0]);
    setAttachments([...attachments, sanitizedFile]);

    mainCtx?.onAttachmentAdded?.(sanitizedFile);
    mainCtx?.attachmentsEventListener("add", sanitizedFile);
  };
  const handleOnOpen = (attachment: Attachment) => {
    mainCtx?.onOpenAttachment?.(attachment);
    mainCtx?.attachmentsEventListener?.("open", attachment);
  };

  return (
    <>
      <SearchTextField width={"full"} value={query} onChange={setQuery} />
      <BasicDiv
        size={"full"}
        maxHeight={"10rem"}
        spill={"auto"}
        padding={queryNotFound ? "lg" : undefined}
        centerContent={queryNotFound}
      >
        {queryNotFound ? (
          <span style={{ opacity: 0.75 }}>{`"${query}" not found`}</span>
        ) : (
          filteredAttachments.map((attachment, idx, arr) => (
            <Attachment
              key={attachment.uid}
              scrollIntoView={
                initialRenderRef.read() === false && idx === arr.length - 1
              }
              value={attachment}
              hideDeleteButton={mainCtx.hideDeleteButton}
              hideOpenAttachmentButton={mainCtx.hideOpenAttachmentButton}
              disableDelete={
                typeof mainCtx?.deleteDisabled === "function"
                  ? mainCtx.deleteDisabled(attachment)
                  : mainCtx?.deleteDisabled
              }
              disableOpen={
                typeof mainCtx?.openDisabled === "function"
                  ? mainCtx.openDisabled(attachment)
                  : mainCtx?.openDisabled
              }
              onDelete={handleOnDelete}
              onOpen={handleOnOpen}
            />
          ))
        )}
      </BasicDiv>
      {!mainCtx.hideUploadButton && (
        <UploadButton
          getFilePath={mainCtx?.getFilePath}
          disabled={mainCtx?.uploadDisabled}
          fileClass="attachment"
          size="xs"
          width={"full"}
          onAccept={handleOnUpload}
        />
      )}
    </>
  );
}

function Attachment(props: {
  value: Attachment;
  scrollIntoView: boolean;
  disableDelete?: boolean;
  disableOpen?: boolean;
  hideDeleteButton?: boolean;
  hideOpenAttachmentButton?: boolean;
  onDelete?: (attachment: Attachment) => void;
  onOpen?: (attachement: Attachment) => void;
}) {
  const { typeAlias, path, name: filename, sizeInBytes } = props.value;
  const Icon = getFileIcon(typeAlias);

  return (
    <BasicCard.Root
      corners={"md"}
      width={"full"}
      sx={{
        cursor: "default",
        overflow: "hidden",
        transition: "all 300ms linear",
        ":hover": {
          backgroundColor: "outline[0.1]",
        },
      }}
    >
      <BasicCard.LeadingAddOn
        size={"2rem"}
        aspectRatio={1}
        color={typeAlias}
        padding={"sm"}
        corners={"md"}
        backgroundColor={"onSurface[0.1]"}
        style={{ flexShrink: 0 }}
      >
        {typeAlias === "img" && path.trim() ? (
          <BasicImg
            src={path.trim()}
            size={"full"}
            corners={"md"}
            spill={"hidden"}
          />
        ) : (
          <Icon.outlined size={"100%"} />
        )}
      </BasicCard.LeadingAddOn>

      <BasicCard.Content gap={"sm"} width={"full"}>
        <BasicCard.Item truncateStyle={"ellipsis"} value={filename} />

        <BasicDiv
          ref={(r) =>
            r &&
            props.scrollIntoView &&
            r.scrollIntoView({ behavior: "instant" })
          }
          fade={0.7}
          row
          align="center"
          gap={"sm"}
          fontSize="xxs"
        >
          <BasicSpan fontWeight="bold" text={typeAlias.toUpperCase()} />
          <BasicDiv
            size={".25rem"}
            corners={"circle"}
            backgroundColor="onSurface"
          />
          <BasicSpan fade={0.5} text={format("file-size", sizeInBytes)} />
        </BasicDiv>
      </BasicCard.Content>

      {(!props.hideDeleteButton || !props.hideOpenAttachmentButton) && (
        <BasicCard.TrailingAddOn row gap={"sm"} align="center">
          {!props.hideOpenAttachmentButton && (
            <OpenButton
              iconOnly
              disabled={props.disableOpen}
              borderColor="transparent"
              size="sm"
              onClick={() => props.onOpen?.(props.value)}
            />
          )}

          {!props.hideDeleteButton && (
            <DeleteButton
              iconOnly
              disabled={props.disableDelete}
              backgroundColor="transparent"
              color="delete"
              size="sm"
              onClick={() => props.onDelete?.(props.value)}
            />
          )}
        </BasicCard.TrailingAddOn>
      )}
    </BasicCard.Root>
  );
}

function AttachmentsNotFound() {
  const ctx = useContext(MainContext);
  return (
    <EmptyState.Root>
      <EmptyState.Indicator
        size="7rem"
        disableFade
        element={
          <BasicImg
            spill={"hidden"}
            size={"full"}
            src={imageResolver("FlyLeavingBox")}
          />
        }
      />
      <EmptyState.Content
        title="Attachments not found"
        description="Upload an attachment and it will appear here."
      />
      {!ctx.hideUploadButton && (
        <UploadButton
          disabled={ctx.uploadDisabled}
          getFilePath={ctx.getFilePath}
          fileClass="attachment"
          backgroundColor="secondaryContainer"
          color="onSecondaryContainer"
          accepts={ctx.accepts}
          onAccept={(_, files) => {
            files.forEach((file) => {
              ctx?.attachmentsEventListener?.("add", sanitizeLocalFile(file));
            });
            ctx.rerender();
          }}
        />
      )}
    </EmptyState.Root>
  );
}

export default AttachmentsDialog;
export type { ContextType as AttachmentDialogContextType };
