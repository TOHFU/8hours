import { act, fireEvent, render, screen } from "@testing-library/react";
import { sendNotification } from "@tauri-apps/plugin-notification";
import App from "./App";
import { EIGHT_HOURS_MS, THIRTY_MINUTES_MS } from "./hooks/useTimer";
import { saveAppState } from "./lib/appState";
import { createDefaultAppState } from "./types/appState";
import {
  playMainTimerEndSound,
  playSubTimerCelebrationSound,
  playSubTimerEndSound,
} from "./utils/playTimerEndSound";

vi.mock("./utils/playToggleSound", () => ({
  playToggleSound: vi.fn(),
  playToggleOnSound: vi.fn(),
  playToggleOffSound: vi.fn(),
}));

vi.mock("./utils/playSelectSound", () => ({
  playSelectSound: vi.fn(),
}));

vi.mock("./utils/playTapSound", () => ({
  playTapSound: vi.fn(),
}));

vi.mock("./utils/playSwipeSound", () => ({
  playSwipeSound: vi.fn(),
}));

vi.mock("./utils/playCelebrationSound", () => ({
  playCelebrationSound: vi.fn(),
}));

vi.mock("./utils/playTransitionSound", () => ({
  playTransitionUpSound: vi.fn(),
  playTransitionDownSound: vi.fn(),
}));

vi.mock("./utils/playTimerEndSound", () => ({
  playMainTimerEndSound: vi.fn(),
  playSubTimerEndSound: vi.fn(),
  playSubTimerCelebrationSound: vi.fn(),
}));

vi.mock("./lib/soundMute", () => ({
  isSoundMuted: vi.fn(() => false),
  setSoundMuted: vi.fn(),
  toggleSoundMuted: vi.fn(() => false),
}));

vi.mock("@tauri-apps/plugin-notification", () => ({
  isPermissionGranted: vi.fn().mockResolvedValue(true),
  requestPermission: vi.fn().mockResolvedValue("granted"),
  sendNotification: vi.fn(),
}));

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("8時間タイマーの初期表示を描画する", () => {
    render(<App />);

    expect(screen.getByText("08:00:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PAUSE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "RESET" })).toBeInTheDocument();
  });

  it("一時停止とリセットを操作できる", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "PAUSE" }));
    expect(screen.getByRole("button", { name: "PLAY" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("08:00:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PLAY" }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("07:59:59")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "RESET" }));
    expect(screen.getByText("08:00:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PAUSE" })).toBeInTheDocument();
  });

  it("25分タイマーを押し込み式ボタンで開始・停止できる", () => {
    render(<App />);
    const subTimerButton = screen.getByRole("button", { name: "25" });

    expect(screen.queryByText("00:30:00")).not.toBeInTheDocument();
    expect(subTimerButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(subTimerButton);

    expect(subTimerButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("00:30:00")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("00:29:59")).toBeInTheDocument();

    fireEvent.click(subTimerButton);

    expect(subTimerButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText("00:29:59")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    fireEvent.click(subTimerButton);

    expect(subTimerButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("00:30:00")).toBeInTheDocument();
  });

  it("25分タイマーが終了するとボタンが通常状態に戻る", () => {
    render(<App />);
    const subTimerButton = screen.getByRole("button", { name: "25" });

    fireEvent.click(subTimerButton);

    act(() => {
      vi.advanceTimersByTime(THIRTY_MINUTES_MS);
    });

    expect(subTimerButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText("00:00:00")).not.toBeInTheDocument();
  });

  it("PAUSEで8時間と25分タイマーを同時に停止・再開できる", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "25" }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("07:59:59")).toBeInTheDocument();
    expect(screen.getByText("00:29:59")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PAUSE" }));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("07:59:59")).toBeInTheDocument();
    expect(screen.getByText("00:29:59")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PLAY" }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("07:59:58")).toBeInTheDocument();
    expect(screen.getByText("00:29:58")).toBeInTheDocument();
  });

  it("RESETで8時間タイマーをリセットし25分タイマーをOFFにする", () => {
    render(<App />);
    const subTimerButton = screen.getByRole("button", { name: "25" });

    fireEvent.click(subTimerButton);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("00:29:59")).toBeInTheDocument();
    expect(subTimerButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "RESET" }));

    expect(screen.getByText("08:00:00")).toBeInTheDocument();
    expect(screen.queryByText("00:29:59")).not.toBeInTheDocument();
    expect(subTimerButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "PAUSE" })).toBeInTheDocument();
  });

  it("8時間タイマーは 0 秒以降もマイナス表示で進み、0 到達時に終了音と通知を出す", async () => {
    render(<App />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(EIGHT_HOURS_MS);
    });

    expect(screen.getByText("00:00:00")).toBeInTheDocument();
    expect(playMainTimerEndSound).toHaveBeenCalledTimes(1);
    expect(sendNotification).toHaveBeenCalledWith({
      title: "8hours",
      body: "8時間経過しました。",
    });
    expect(screen.getByRole("button", { name: "PAUSE" })).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(screen.getByText("-00:00:01")).toBeInTheDocument();
    expect(playMainTimerEndSound).toHaveBeenCalledTimes(1);
    expect(sendNotification).toHaveBeenCalledTimes(1);
  });

  it("25分タイマーは 0 到達時に終了音と通知を1回だけ出す", async () => {
    render(<App />);
    const subTimerButton = screen.getByRole("button", { name: "25" });

    fireEvent.click(subTimerButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(THIRTY_MINUTES_MS);
    });

    expect(playSubTimerEndSound).toHaveBeenCalledTimes(1);
    expect(sendNotification).toHaveBeenCalledWith({
      title: "8hours",
      body: "30分経過しました。",
    });
  });

  it("25分タイマーは25分経過(残り5分)時にお祝いサウンドと通知を1回だけ出す", async () => {
    render(<App />);
    const subTimerButton = screen.getByRole("button", { name: "25" });

    fireEvent.click(subTimerButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(25 * 60 * 1000);
    });

    expect(playSubTimerCelebrationSound).toHaveBeenCalledTimes(1);
    expect(playSubTimerEndSound).not.toHaveBeenCalled();
    expect(sendNotification).toHaveBeenCalledWith({
      title: "8hours",
      body: "25分間、お疲れ様でした。",
    });
    expect(sendNotification).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    });

    expect(playSubTimerCelebrationSound).toHaveBeenCalledTimes(1);
    expect(playSubTimerEndSound).toHaveBeenCalledTimes(1);
    expect(sendNotification).toHaveBeenCalledWith({
      title: "8hours",
      body: "30分経過しました。",
    });
    expect(sendNotification).toHaveBeenCalledTimes(2);
  });

  it("保存済みの状態からタイマーと TODO を復元する", () => {
    const persistedState = createDefaultAppState();
    persistedState.mainTimer = {
      remainingMs: 3_600_000,
      isRunning: false,
      endTimeMs: null,
    };
    persistedState.todos[0] = {
      id: "todo-1",
      text: "保存済みタスク",
      color: "pink",
      checked: true,
    };
    saveAppState(persistedState);

    render(<App />);

    expect(screen.getByText("01:00:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PLAY" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("保存済みタスク")).toBeInTheDocument();
  });
});
