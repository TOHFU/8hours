import { useEffect, useRef } from "react";
import { resizeWindowToHeight } from "../utils/resizeWindow";

export function useAdjustWindowHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const updateHeight = () => {
      const { height } = element.getBoundingClientRect();
      void resizeWindowToHeight(height);
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return ref;
}
