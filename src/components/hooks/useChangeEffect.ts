import React, { useEffect, useRef } from "react";

/**
 * A `useEffect` hook that only calls the effect after the initial render. Essentially only when the deps change.
 * @param effect — Imperative function that can return a cleanup function
 * @param deps — If present, effect will only activate if the values in the list change.
 */
function useChangeEffect(
  effect: React.EffectCallback,
  deps: React.DependencyList
) {
  const initialRender = useRef(true);
  useEffect(() => {
    if (!initialRender.current) return effect();
    else {
      initialRender.current = false;
    }
  }, deps);
}

export default useChangeEffect;
