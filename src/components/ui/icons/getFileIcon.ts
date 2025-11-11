import { LocalFile } from "@wavy/types";
import { IconType } from "react-icons";
import { AiFillFileUnknown, AiOutlineFileUnknown } from "react-icons/ai";
import {
  FaFileImage,
  FaFilePdf,
  FaRegFileImage,
  FaRegFilePdf,
} from "react-icons/fa";
import {
  RiFileExcel2Fill,
  RiFileExcel2Line,
  RiFileTextFill,
  RiFileTextLine,
  RiFileWord2Fill,
  RiFileWord2Line,
} from "react-icons/ri";

function getFileIcon(alias: LocalFile["typeAlias"]): {
  filled: IconType;
  outlined: IconType;
} {
  switch (alias) {
    case "excel":
      return { filled: RiFileExcel2Fill, outlined: RiFileExcel2Line };
    case "word":
      return { filled: RiFileWord2Fill, outlined: RiFileWord2Line };

    case "pdf":
      return { filled: FaFilePdf, outlined: FaRegFilePdf };
    case "img":
      return { filled: FaFileImage, outlined: FaRegFileImage };

    case "txt":
      return { filled: RiFileTextFill, outlined: RiFileTextLine };

    case "unknown":
      return { filled: AiFillFileUnknown, outlined: AiOutlineFileUnknown };
    default:
      return alias satisfies never;
  }
}

export { getFileIcon };
