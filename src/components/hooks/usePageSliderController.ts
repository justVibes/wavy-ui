function usePageSliderController(defaultPage: number) {
  return {
    defaultPage,
    goTo: (_: number): void => null,
    isActive: (_: number): boolean => null,
    onPageChange: (_: (_: number) => void): void => null,
  };
}

type UsePageSliderControllerReturn = ReturnType<typeof usePageSliderController>;

export default usePageSliderController;
export type { UsePageSliderControllerReturn };
