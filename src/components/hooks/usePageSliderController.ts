import React, { useState } from "react";

function usePageSliderController(defaultPage: number) {
  //   const [active, setActive] = useState(defaultPage ?? 0);
  //   let onChangeCb: (page: number) => void;

  return {
    defaultPage,
    goTo: (page: number) => {},
    isActive: (page: number): boolean => {
      return;
    },
  };
}

type UsePageSliderControllerReturn = ReturnType<typeof usePageSliderController>;

export default usePageSliderController;
export type { UsePageSliderControllerReturn };
