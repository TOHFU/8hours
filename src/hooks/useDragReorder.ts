import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";

/** マウスダウンから既定でこの時間(ms)以上経過するとドラッグを開始する */
const DEFAULT_LONG_PRESS_MS = 300;
/** 長押し確定前に既定でこの距離(px)以上動いたら長押しをキャンセルする */
const DEFAULT_MOVE_CANCEL_THRESHOLD_PX = 6;
/** 行の高さが計測できない場合に使う既定のフォールバック値(px) */
const DEFAULT_FALLBACK_ROW_HEIGHT_PX = 49;
/** 入れ替わったアイテムがスライドして収まるアニメーションの既定の時間(ms) */
const DEFAULT_REORDER_TRANSITION_MS = 180;

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

function createInitialDragState(fallbackRowHeightPx: number): DragState {
  return {
    phase: "idle",
    pressedId: null,
    startClientY: 0,
    startIndex: 0,
    rowHeight: fallbackRowHeightPx,
    lastTargetIndex: 0,
    timeoutId: null,
  };
}

export type DragReorderItemProps = {
  ref: (element: HTMLElement | null) => void;
  onMouseDown: (event: ReactMouseEvent) => void;
  isDragging: boolean;
  style: CSSProperties | undefined;
};

export type UseDragReorderOptions = {
  /** 並び替え対象の id を、現在の表示順で並べた配列 */
  ids: string[];
  /** id を toIndex の位置に移動させたいときに呼ばれる */
  onReorder: (id: string, toIndex: number) => void;
  /** マウスダウンからドラッグ開始までの長押し時間(ms)。既定 300ms */
  longPressMs?: number;
  /** 長押し確定前にドラッグをキャンセルする移動距離(px)。既定 6px */
  moveCancelThresholdPx?: number;
  /** 入れ替わったアイテムがスライドして収まるアニメーション時間(ms)。既定 180ms */
  reorderTransitionMs?: number;
};

/**
 * 縦一列に並んだリストを、長押し(既定300ms)からのマウスドラッグで並び替えられるようにする汎用フック。
 *
 * - 各アイテムの DOM 要素は `registerItemRef` (または `getItemProps(id).ref`) で登録する
 * - 各アイテムの `onMouseDown` に `handleItemMouseDown(id, event)` (または `getItemProps(id).onMouseDown`) を渡す
 * - ドラッグ中のアイテムはマウスの Y 移動に追従し、他のアイテムと入れ替わった位置は
 *   スライドアニメーション(FLIP)で滑らかに収まる
 */
export function useDragReorder({
  ids,
  onReorder,
  longPressMs = DEFAULT_LONG_PRESS_MS,
  moveCancelThresholdPx = DEFAULT_MOVE_CANCEL_THRESHOLD_PX,
  reorderTransitionMs = DEFAULT_REORDER_TRANSITION_MS,
}: UseDragReorderOptions) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);

  const idsRef = useRef(ids);
  idsRef.current = ids;

  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  const reorderTransition = `transform ${reorderTransitionMs}ms ease`;

  const itemElementsRef = useRef(new Map<string, HTMLElement>());
  const prevTopsRef = useRef(new Map<string, number>());
  const dragStateRef = useRef<DragState>(
    createInitialDragState(DEFAULT_FALLBACK_ROW_HEIGHT_PX),
  );
  // ドラッグによる入れ替えが発生した直後の render でだけ FLIP アニメーションを行うためのフラグ
  // (追加・削除など、入れ替え以外で ids が変化したときは何もしない)
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
    const currentIds = idsRef.current;
    const index = currentIds.indexOf(id);
    const currentEl = itemElementsRef.current.get(id);
    const neighborId = currentIds[index + 1] ?? currentIds[index - 1];
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
    return height > 0 ? height : DEFAULT_FALLBACK_ROW_HEIGHT_PX;
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
      if (Math.abs(deltaY) > moveCancelThresholdPx) {
        resetDragStateRef.current();
      }
      return;
    }

    const rowHeight = state.rowHeight || DEFAULT_FALLBACK_ROW_HEIGHT_PX;
    const offsetSteps = Math.round(deltaY / rowHeight);
    const currentIds = idsRef.current;
    const targetIndex = Math.max(
      0,
      Math.min(state.startIndex + offsetSteps, currentIds.length - 1),
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
    dragStateRef.current = createInitialDragState(
      DEFAULT_FALLBACK_ROW_HEIGHT_PX,
    );
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
      state.startIndex = idsRef.current.indexOf(id);
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
      }, longPressMs);
    },
    [longPressMs, measureRowHeight, resetDragState],
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
  // 追加・削除など入れ替え以外で ids が変化したときは、それぞれ専用のアニメーションに任せ、
  // ここでは位置の基準(prevTops)を更新するだけにして余計な translateY を適用しない。
  useLayoutEffect(() => {
    const elements = itemElementsRef.current;
    const prevTops = prevTopsRef.current;
    const nextTops = new Map<string, number>();
    const shouldAnimate = pendingReorderFlipRef.current;
    pendingReorderFlipRef.current = false;

    for (const id of ids) {
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
        element.style.transition = reorderTransition;
        element.style.transform = "";

        const clearInlineTransition = () => {
          element.style.transition = "";
          element.removeEventListener("transitionend", clearInlineTransition);
        };
        element.addEventListener("transitionend", clearInlineTransition);
      });
    }

    prevTopsRef.current = nextTops;
  }, [ids, draggingId, reorderTransition]);

  const getItemProps = useCallback(
    (id: string): DragReorderItemProps => {
      const isDragging = draggingId === id;
      return {
        ref: (element) => registerItemRef(id, element),
        onMouseDown: (event) => handleItemMouseDown(id, event),
        isDragging,
        style: isDragging
          ? { transform: `translateY(${dragOffsetY}px)` }
          : undefined,
      };
    },
    [draggingId, dragOffsetY, handleItemMouseDown, registerItemRef],
  );

  return useMemo(
    () => ({
      draggingId,
      dragOffsetY,
      registerItemRef,
      handleItemMouseDown,
      getItemProps,
    }),
    [
      draggingId,
      dragOffsetY,
      registerItemRef,
      handleItemMouseDown,
      getItemProps,
    ],
  );
}
