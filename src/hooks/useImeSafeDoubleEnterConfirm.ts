import { useCallback, useRef } from "react";
import type { KeyboardEvent } from "react";

type UseImeSafeDoubleEnterConfirmOptions = {
  onConfirm: () => void;
  confirmKey?: string;
};

function useImeSafeDoubleEnterConfirm<
  TElement extends HTMLInputElement | HTMLTextAreaElement,
>({
  onConfirm,
  confirmKey = "Enter",
}: UseImeSafeDoubleEnterConfirmOptions) {
  const pendingConfirmRef = useRef(false);

  const resetPendingConfirm = useCallback(() => {
    pendingConfirmRef.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<TElement>) => {
      if (event.key !== confirmKey || event.nativeEvent.isComposing) {
        resetPendingConfirm();
        return;
      }

      event.preventDefault();

      if (!pendingConfirmRef.current) {
        pendingConfirmRef.current = true;
        return;
      }

      resetPendingConfirm();
      onConfirm();
    },
    [confirmKey, onConfirm, resetPendingConfirm],
  );

  return {
    handleKeyDown,
    resetPendingConfirm,
  };
}

export default useImeSafeDoubleEnterConfirm;