import { act, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { FIFTEEN_MINUTES_MS } from "./hooks/useTimer";

vi.mock("./utils/playToggleSound", () => ({
  playToggleSound: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-notification", () => ({
  isPermissionGranted: vi.fn().mockResolvedValue(true),
  requestPermission: vi.fn().mockResolvedValue("granted"),
  sendNotification: vi.fn(),
}));

describe("App", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it("15分タイマーを押し込み式ボタンで開始・停止できる", () => {
    render(<App />);
    const subTimerButton = screen.getByRole("button", { name: "15" });

    expect(screen.queryByText("00:15:00")).not.toBeInTheDocument();
    expect(subTimerButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(subTimerButton);

    expect(subTimerButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("00:15:00")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("00:14:59")).toBeInTheDocument();

    fireEvent.click(subTimerButton);

    expect(subTimerButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText("00:14:59")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    fireEvent.click(subTimerButton);

    expect(subTimerButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("00:15:00")).toBeInTheDocument();
  });

  it("15分タイマーが終了するとボタンが通常状態に戻る", () => {
    render(<App />);
    const subTimerButton = screen.getByRole("button", { name: "15" });

    fireEvent.click(subTimerButton);

    act(() => {
      vi.advanceTimersByTime(FIFTEEN_MINUTES_MS);
    });

    expect(subTimerButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText("00:00:00")).not.toBeInTheDocument();
  });

  it("PAUSEで8時間と15分タイマーを同時に停止・再開できる", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "15" }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("07:59:59")).toBeInTheDocument();
    expect(screen.getByText("00:14:59")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PAUSE" }));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("07:59:59")).toBeInTheDocument();
    expect(screen.getByText("00:14:59")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PLAY" }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("07:59:58")).toBeInTheDocument();
    expect(screen.getByText("00:14:58")).toBeInTheDocument();
  });

  it("RESETで8時間タイマーをリセットし15分タイマーをOFFにする", () => {
    render(<App />);
    const subTimerButton = screen.getByRole("button", { name: "15" });

    fireEvent.click(subTimerButton);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("00:14:59")).toBeInTheDocument();
    expect(subTimerButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "RESET" }));

    expect(screen.getByText("08:00:00")).toBeInTheDocument();
    expect(screen.queryByText("00:14:59")).not.toBeInTheDocument();
    expect(subTimerButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "PAUSE" })).toBeInTheDocument();
  });
});
