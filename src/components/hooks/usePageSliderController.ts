function usePageSliderController<T = void>(
  defaultPage = 0
): UsePageSliderControllerReturn<T> {
  return {
    defaultPage,
    goTo: () => null,
    echo: (): T => null,
    getActivePage: (): number => null,
    isPageActive: () => null,
    onPageChange: () => null,
  };
}

// document.getElementById().scrollIntoView({"behavior": ""})

type UsePageSliderControllerReturn<T = void> = {
  defaultPage: number;
  goTo: (
    pageIndex: number,
    options?: Partial<{
      /**@default false */
      ignoreOutOfBoundsCheck: boolean;
      /**@default "smooth" */
      transition: "instant" | "smooth";
      /**The duration of a `smooth` transition in milliseconds.
       * @default 200 */
      transitionDuration: number;
    }>
  ) => void;
  echo: (message?: string) => T;
  getActivePage: () => number;
  isPageActive: (pageIndex: number) => boolean;
  onPageChange: (callback: (from: number, to: number) => void) => void;
};

export default usePageSliderController;
export type { UsePageSliderControllerReturn };
