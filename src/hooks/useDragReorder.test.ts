import { act, renderHook } from "@testing-library/react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useDragReorder } from "./useDragReorder";

function createMouseDownEvent(clientY: number): ReactMouseEvent {
  return { button: 0, clientY } as unknown as ReactMouseEvent;
}

describe("useDragReorder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("300ms未満でマウスを離した場合はドラッグを開始しない", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useDragReorder({ ids: ["a", "b", "c"], onReorder }),
    );

    act(() => {
      result.current.handleItemMouseDown("a", createMouseDownEvent(0));
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.draggingId).toBeNull();

    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.draggingId).toBeNull();
  });

  it("300ms以上の長押しでドラッグを開始する", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useDragReorder({ ids: ["a", "b", "c"], onReorder }),
    );

    act(() => {
      result.current.handleItemMouseDown("a", createMouseDownEvent(0));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.draggingId).toBe("a");

    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });

    expect(result.current.draggingId).toBeNull();
  });

  it("長押し時間はオプションで変更できる", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useDragReorder({ ids: ["a", "b", "c"], onReorder, longPressMs: 1000 }),
    );

    act(() => {
      result.current.handleItemMouseDown("a", createMouseDownEvent(0));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.draggingId).toBeNull();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(result.current.draggingId).toBe("a");
  });

  it("長押し確定前に大きくマウスが動くとドラッグをキャンセルする", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useDragReorder({ ids: ["a", "b", "c"], onReorder }),
    );

    act(() => {
      result.current.handleItemMouseDown("a", createMouseDownEvent(0));
    });

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientY: 50 }));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.draggingId).toBeNull();
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("ドラッグ中はマウスのY方向に追従し、しきい値を超えると onReorder を呼ぶ", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useDragReorder({ ids: ["a", "b", "c"], onReorder }),
    );

    act(() => {
      result.current.handleItemMouseDown("a", createMouseDownEvent(0));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.draggingId).toBe("a");

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientY: 20 }));
    });

    // 入れ替えしきい値(行の高さ)未満の移動では、そのままマウスの移動量に追従する
    expect(result.current.dragOffsetY).toBe(20);
    expect(onReorder).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });

    expect(result.current.draggingId).toBeNull();
    expect(result.current.dragOffsetY).toBe(0);
  });

  it("入れ替え発生後もアイテムがマウスの実位置に一致し続ける", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useDragReorder({ ids: ["a", "b", "c"], onReorder }),
    );

    act(() => {
      result.current.handleItemMouseDown("a", createMouseDownEvent(0));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // フォールバックの行の高さ(49px)分マウスを動かして入れ替えを発生させる
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientY: 49 }));
    });

    expect(onReorder).toHaveBeenCalledWith("a", 1);
    // 入れ替え済みの行数分レイアウト位置が動いているため、
    // その分を打ち消した結果マウスの実移動量と一致する差分になる
    expect(result.current.dragOffsetY).toBe(0);

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientY: 60 }));
    });

    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(result.current.dragOffsetY).toBe(11);
  });

  it("同じマウス位置ではしきい値を跨がない限り onReorder を再度呼ばない", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useDragReorder({ ids: ["a", "b", "c"], onReorder }),
    );

    act(() => {
      result.current.handleItemMouseDown("a", createMouseDownEvent(0));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientY: 10 }));
    });

    expect(onReorder).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientY: 20 }));
    });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it("getItemProps はドラッグ中のアイテムに transform を含む style を返す", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useDragReorder({ ids: ["a", "b", "c"], onReorder }),
    );

    expect(result.current.getItemProps("a").isDragging).toBe(false);
    expect(result.current.getItemProps("a").style).toBeUndefined();

    act(() => {
      result.current.handleItemMouseDown("a", createMouseDownEvent(0));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientY: 15 }));
    });

    const draggedProps = result.current.getItemProps("a");
    expect(draggedProps.isDragging).toBe(true);
    expect(draggedProps.style).toEqual({ transform: "translateY(15px)" });

    expect(result.current.getItemProps("b").isDragging).toBe(false);
  });
});
