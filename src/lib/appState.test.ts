import {
  APP_STATE_STORAGE_KEY,
  createDefaultAppState,
} from "../types/appState";
import { loadAppState, saveAppState } from "./appState";

describe("appState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("保存した状態を読み込める", () => {
    const state = createDefaultAppState();
    state.todos[0] = {
      id: "todo-1",
      text: "メールの返信",
      color: "blue",
      checked: true,
    };
    state.mainTimer = {
      remainingMs: 3_600_000,
      isRunning: false,
      endTimeMs: null,
    };
    state.isSubTimerActive = true;
    state.subTimer = {
      remainingMs: 600_000,
      isRunning: true,
      endTimeMs: Date.now() + 600_000,
    };

    saveAppState(state);

    expect(loadAppState()).toEqual(state);
  });

  it("保存データがない場合はデフォルト状態を返す", () => {
    const state = loadAppState();

    expect(state.todos).toHaveLength(1);
    expect(state.mainTimer.isRunning).toBe(true);
    expect(state.isSubTimerActive).toBe(false);
  });

  it("不正な JSON の場合はデフォルト状態を返す", () => {
    window.localStorage.setItem(APP_STATE_STORAGE_KEY, "{ invalid");

    const state = loadAppState();

    expect(state.todos).toHaveLength(1);
    expect(state.isSubTimerActive).toBe(false);
  });
});
