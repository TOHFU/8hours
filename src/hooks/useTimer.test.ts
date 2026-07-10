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
    expect(formatTime(-3_661_000)).toBe("-01:01:01");
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

  it("allowOverrun: true では 0 秒を過ぎてもマイナス表示で進み続ける", () => {
    const { result } = renderHook(() =>
      useTimer({ totalMs: 2_000, allowOverrun: true }),
    );

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    expect(result.current.formattedTime).toBe("-00:00:01");
    expect(result.current.progress).toBe(-0.5);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isFinished).toBe(true);
  });

  it("initialState から停止中の残り時間を復元できる", () => {
    const { result } = renderHook(() =>
      useTimer({
        totalMs: EIGHT_HOURS_MS,
        autoStart: false,
        initialState: {
          remainingMs: 3_600_000,
          isRunning: false,
          endTimeMs: null,
        },
      }),
    );

    expect(result.current.formattedTime).toBe("01:00:00");
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(true);
  });

  it("initialState の endTimeMs から実行中状態を復元できる", () => {
    const endTimeMs = Date.now() + 5_000;

    const { result } = renderHook(() =>
      useTimer({
        totalMs: EIGHT_HOURS_MS,
        autoStart: false,
        initialState: {
          remainingMs: 5_000,
          isRunning: true,
          endTimeMs,
        },
      }),
    );

    expect(result.current.isRunning).toBe(true);
    expect(result.current.formattedTime).toBe("00:00:05");

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(result.current.formattedTime).toBe("00:00:03");
    expect(result.current.getPersistedState()).toEqual({
      remainingMs: 3_000,
      isRunning: true,
      endTimeMs,
    });
  });

  it("allowOverrun: true ではマイナス時間でも再開できる", () => {
    const { result } = renderHook(() =>
      useTimer({ totalMs: 2_000, allowOverrun: true }),
    );

    act(() => {
      vi.advanceTimersByTime(3_000);
      result.current.togglePause();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(true);
    expect(result.current.formattedTime).toBe("-00:00:01");

    act(() => {
      result.current.togglePause();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.formattedTime).toBe("-00:00:02");
  });

  it("0 秒通過時に onNaturalZeroCross を呼ぶ", () => {
    const onNaturalZeroCross = vi.fn();

    renderHook(() =>
      useTimer({ totalMs: 2_000, onNaturalZeroCross }),
    );

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(onNaturalZeroCross).toHaveBeenCalledTimes(1);
  });

  it("長時間の復帰で 0 秒通過済みのとき onNaturalZeroCross を呼ばない", () => {
    const onNaturalZeroCross = vi.fn();

    const { result } = renderHook(() =>
      useTimer({ totalMs: 5_000, onNaturalZeroCross }),
    );

    act(() => {
      vi.advanceTimersByTime(4_000);
    });

    expect(result.current.formattedTime).toBe("00:00:01");

    act(() => {
      vi.setSystemTime(Date.now() + 60_000);
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.isFinished).toBe(true);
    expect(onNaturalZeroCross).not.toHaveBeenCalled();
  });

  it("0 秒通過済みの initialState 復元時は onNaturalZeroCross を呼ばない", () => {
    const onNaturalZeroCross = vi.fn();
    const endTimeMs = Date.now() - 60_000;

    renderHook(() =>
      useTimer({
        totalMs: 5_000,
        autoStart: false,
        initialState: {
          remainingMs: -55_000,
          isRunning: true,
          endTimeMs,
        },
        onNaturalZeroCross,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(onNaturalZeroCross).not.toHaveBeenCalled();
  });
});
