import { EIGHT_HOURS_MS, FIFTEEN_MINUTES_MS } from "../hooks/useTimer";
import { createEmptyTodoItem, type TodoItemData } from "./todo";

export const APP_STATE_STORAGE_KEY = "8hours-app-state";
export const APP_STATE_VERSION = 1;

export type PersistedTimerState = {
  remainingMs: number;
  isRunning: boolean;
  endTimeMs: number | null;
};

export type PersistedAppState = {
  version: typeof APP_STATE_VERSION;
  mainTimer: PersistedTimerState;
  subTimer: PersistedTimerState;
  isSubTimerActive: boolean;
  todos: TodoItemData[];
};

export function createDefaultMainTimerState(): PersistedTimerState {
  return {
    remainingMs: EIGHT_HOURS_MS,
    isRunning: true,
    endTimeMs: Date.now() + EIGHT_HOURS_MS,
  };
}

export function createDefaultSubTimerState(): PersistedTimerState {
  return {
    remainingMs: FIFTEEN_MINUTES_MS,
    isRunning: false,
    endTimeMs: null,
  };
}

export function createDefaultAppState(): PersistedAppState {
  return {
    version: APP_STATE_VERSION,
    mainTimer: createDefaultMainTimerState(),
    subTimer: createDefaultSubTimerState(),
    isSubTimerActive: false,
    todos: [createEmptyTodoItem()],
  };
}
