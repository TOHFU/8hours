import { act, renderHook } from "@testing-library/react";
import {
  EIGHT_HOURS_MS,
  FIFTEEN_MINUTES_MS,
  formatTime,
  useTimer,
} from "./useTimer";

describe("formatTime", () => {
  it("残り時間を HH:MM:SS 形式で表示する", () => {
    expect(formatTime(EIGHT_HOURS_MS)).toBe("08:00:00");
    expect(formatTime(FIFTEEN_MINUTES_MS)).toBe("00:15:00");
    expect(formatTime(3_661_000)).toBe("01:01:01");
    expect(formatTime(0)).toBe("00:00:00");
  });
});

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("8時間からカウントダウンし progress が減少する", () => {
    const { result } = renderHook(() => useTimer());

    expect(result.current.formattedTime).toBe("08:00:00");
    expect(result.current.progress).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.formattedTime).toBe("07:59:59");
    expect(result.current.progress).toBeCloseTo((EIGHT_HOURS_MS - 1000) / EIGHT_HOURS_MS);
  });

  it("一時停止と再開を切り替えられる", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.togglePause();
    });

    expect(result.current.isPaused).toBe(true);
    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.formattedTime).toBe("08:00:00");

    act(() => {
      result.current.togglePause();
    });

    expect(result.current.isRunning).toBe(true);
  });

  it("リセットで残り時間と progress を初期化する", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      vi.advanceTimersByTime(5000);
      result.current.reset();
    });

    expect(result.current.formattedTime).toBe("08:00:00");
    expect(result.current.progress).toBe(1);
    expect(result.current.isRunning).toBe(true);
  });

  it("autoStart: false では reset で 15 分タイマーを開始できる", () => {
    const { result } = renderHook(() =>
      useTimer({ totalMs: FIFTEEN_MINUTES_MS, autoStart: false }),
    );

    expect(result.current.formattedTime).toBe("00:15:00");
    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.formattedTime).toBe("00:14:59");
    expect(result.current.progress).toBeCloseTo(
      (FIFTEEN_MINUTES_MS - 1000) / FIFTEEN_MINUTES_MS,
    );
  });

  it("clear で残り時間を初期化して停止する", () => {
    const { result } = renderHook(() =>
      useTimer({ totalMs: FIFTEEN_MINUTES_MS, autoStart: false }),
    );

    act(() => {
      result.current.reset();
      vi.advanceTimersByTime(5000);
      result.current.clear();
    });

    expect(result.current.formattedTime).toBe("00:15:00");
    expect(result.current.isRunning).toBe(false);
    expect(result.current.progress).toBe(1);
  });

  it("復帰時に経過時間分だけ残り時間を補正する", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.formattedTime).toBe("07:59:59");

    act(() => {
      vi.setSystemTime(Date.now() + 44_000);
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.formattedTime).toBe("07:59:15");
  });
});
