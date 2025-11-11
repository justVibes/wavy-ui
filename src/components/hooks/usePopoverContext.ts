import { useContext } from "react";
import { BasicPopoverContext } from "../contexts/BasicPopoverContext";

function usePopoverContext() {
  return useContext(BasicPopoverContext);
}

export default usePopoverContext;
