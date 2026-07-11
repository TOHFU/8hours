import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

/** マウスダウンからこの時間(ms)以上経過するとドラッグを開始する */
const LONG_PRESS_MS = 1000;
/** 長押し確定前にこの距離(px)以上動いたら長押しをキャンセルする */
const MOVE_CANCEL_THRESHOLD_PX = 6;
/** アイテムの高さが計測できない場合に使うフォールバック値(高さ + gap) */
const FALLBACK_ROW_HEIGHT_PX = 33 + 16;
/** 入れ替わったアイテムがスライドして収まるアニメーションの時間 */
const REORDER_TRANSITION = "transform 0.18s ease";

type DragPhase = "idle" | "pending" | "dragging";

type DragState = {
  phase: DragPhase;
  pressedId: string | null;
  startClientY: number;
  startIndex: number;
  rowHeight: number;
  lastTargetIndex: number;
  timeoutId: number | null;
};

function createInitialDragState(): DragState {
  return {
    phase: "idle",
    pressedId: null,
    startClientY: 0,
    startIndex: 0,
    rowHeight: FALLBACK_ROW_HEIGHT_PX,
    lastTargetIndex: 0,
    timeoutId: null,
  };
}

type UseTodoDragReorderOptions = {
  itemIds: string[];
  onReorder: (id: string, toIndex: number) => void;
};

export function useTodoDragReorder({
  itemIds,
  onReorder,
}: UseTodoDragReorderOptions) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);

  const itemIdsRef = useRef(itemIds);
  itemIdsRef.current = itemIds;

  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  const itemElementsRef = useRef(new Map<string, HTMLElement>());
  const prevTopsRef = useRef(new Map<string, number>());
  const dragStateRef = useRef<DragState>(createInitialDragState());
  // ドラッグによる入れ替えが発生した直後の render でだけ FLIP アニメーションを行うためのフラグ
  // (追加・削除など、入れ替え以外で itemIds が変化したときは何もしない)
  const pendingReorderFlipRef = useRef(false);

  const registerItemRef = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        itemElementsRef.current.set(id, element);
      } else {
        itemElementsRef.current.delete(id);
      }
    },
    [],
  );

  const measureRowHeight = useCallback((id: string): number => {
    const ids = itemIdsRef.current;
    const index = ids.indexOf(id);
    const currentEl = itemElementsRef.current.get(id);
    const neighborId = ids[index + 1] ?? ids[index - 1];
    const neighborEl = neighborId
      ? itemElementsRef.current.get(neighborId)
      : undefined;

    if (currentEl && neighborEl) {
      const diff = Math.abs(
        neighborEl.getBoundingClientRect().top -
          currentEl.getBoundingClientRect().top,
      );
      if (diff > 0) {
        return diff;
      }
    }

    const height = currentEl?.getBoundingClientRect().height ?? 0;
    return height > 0 ? height : FALLBACK_ROW_HEIGHT_PX;
  }, []);

  const resetDragStateRef = useRef<() => void>(() => {});

  // window に addEventListener/removeEventListener する際、常に同一の関数参照を使うための stable wrapper
  const stableMouseMoveHandlerRef = useRef((event: MouseEvent) => {
    const state = dragStateRef.current;
    if (state.phase === "idle" || !state.pressedId) {
      return;
    }

    const deltaY = event.clientY - state.startClientY;

    if (state.phase === "pending") {
      if (Math.abs(deltaY) > MOVE_CANCEL_THRESHOLD_PX) {
        resetDragStateRef.current();
      }
      return;
    }

    const rowHeight = state.rowHeight || FALLBACK_ROW_HEIGHT_PX;
    const offsetSteps = Math.round(deltaY / rowHeight);
    const ids = itemIdsRef.current;
    const targetIndex = Math.max(
      0,
      Math.min(state.startIndex + offsetSteps, ids.length - 1),
    );

    if (targetIndex !== state.lastTargetIndex) {
      state.lastTargetIndex = targetIndex;
      pendingReorderFlipRef.current = true;
      onReorderRef.current(state.pressedId, targetIndex);
    }

    // 入れ替え済みの行数分だけレイアウト上の位置が既にずれているため、
    // その分を打ち消してマウスの実位置に一致させる
    const settledShift = (state.lastTargetIndex - state.startIndex) * rowHeight;
    setDragOffsetY(deltaY - settledShift);
  });

  const stableMouseUpHandlerRef = useRef(() => {
    resetDragStateRef.current();
  });

  const detachWindowListeners = useCallback(() => {
    window.removeEventListener("mousemove", stableMouseMoveHandlerRef.current);
    window.removeEventListener("mouseup", stableMouseUpHandlerRef.current);
  }, []);

  const resetDragState = useCallback(() => {
    const state = dragStateRef.current;
    if (state.timeoutId !== null) {
      window.clearTimeout(state.timeoutId);
    }
    dragStateRef.current = createInitialDragState();
    detachWindowListeners();
    setDraggingId(null);
    setDragOffsetY(0);
  }, [detachWindowListeners]);

  resetDragStateRef.current = resetDragState;

  const handleItemMouseDown = useCallback(
    (id: string, event: ReactMouseEvent) => {
      if (event.button !== 0) {
        return;
      }

      resetDragState();

      const state = dragStateRef.current;
      state.pressedId = id;
      state.phase = "pending";
      state.startClientY = event.clientY;
      state.startIndex = itemIdsRef.current.indexOf(id);
      state.lastTargetIndex = state.startIndex;

      window.addEventListener("mousemove", stableMouseMoveHandlerRef.current);
      window.addEventListener("mouseup", stableMouseUpHandlerRef.current);

      state.timeoutId = window.setTimeout(() => {
        state.timeoutId = null;
        if (state.phase !== "pending" || state.pressedId !== id) {
          return;
        }
        state.phase = "dragging";
        state.rowHeight = measureRowHeight(id);
        setDraggingId(id);
        setDragOffsetY(0);
      }, LONG_PRESS_MS);
    },
    [measureRowHeight, resetDragState],
  );

  useEffect(() => {
    return () => {
      const state = dragStateRef.current;
      if (state.timeoutId !== null) {
        window.clearTimeout(state.timeoutId);
      }
      detachWindowListeners();
    };
  }, [detachWindowListeners]);

  // ドラッグで入れ替わったアイテムを、旧位置からスライドして新しい位置に収まるようアニメーションさせる(FLIP)。
  // 追加・削除など入れ替え以外で itemIds が変化したときは、それぞれ専用のアニメーションに任せ、
  // ここでは位置の基準(prevTops)を更新するだけにして余計な translateY を適用しない。
  useLayoutEffect(() => {
    const elements = itemElementsRef.current;
    const prevTops = prevTopsRef.current;
    const nextTops = new Map<string, number>();
    const shouldAnimate = pendingReorderFlipRef.current;
    pendingReorderFlipRef.current = false;

    for (const id of itemIds) {
      const element = elements.get(id);
      if (!element) {
        continue;
      }

      const nextTop = element.getBoundingClientRect().top;
      nextTops.set(id, nextTop);

      if (!shouldAnimate || id === draggingId) {
        continue;
      }

      const prevTop = prevTops.get(id);
      if (prevTop === undefined) {
        continue;
      }

      const delta = prevTop - nextTop;
      if (Math.abs(delta) < 0.5) {
        continue;
      }

      element.style.transition = "none";
      element.style.transform = `translateY(${delta}px)`;

      requestAnimationFrame(() => {
        element.style.transition = REORDER_TRANSITION;
        element.style.transform = "";

        const clearInlineTransition = () => {
          element.style.transition = "";
          element.removeEventListener("transitionend", clearInlineTransition);
        };
        element.addEventListener("transitionend", clearInlineTransition);
      });
    }

    prevTopsRef.current = nextTops;
  }, [itemIds, draggingId]);

  return {
    draggingId,
    dragOffsetY,
    registerItemRef,
    handleItemMouseDown,
  };
}
