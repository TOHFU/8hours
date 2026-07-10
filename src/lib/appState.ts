import {
  APP_STATE_STORAGE_KEY,
  APP_STATE_VERSION,
  createDefaultAppState,
  type PersistedAppState,
  type PersistedTimerState,
} from "../types/appState";
import { TODO_COLORS, type TodoColor, type TodoItemData } from "../types/todo";

function isPersistedTimerState(value: unknown): value is PersistedTimerState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const timer = value as PersistedTimerState;
  return (
    typeof timer.remainingMs === "number" &&
    typeof timer.isRunning === "boolean" &&
    (timer.endTimeMs === null || typeof timer.endTimeMs === "number")
  );
}

function isTodoColor(value: unknown): value is TodoColor {
  return typeof value === "string" && TODO_COLORS.includes(value as TodoColor);
}

function isTodoItemData(value: unknown): value is TodoItemData {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as TodoItemData;
  return (
    typeof item.id === "string" &&
    typeof item.text === "string" &&
    isTodoColor(item.color) &&
    typeof item.checked === "boolean"
  );
}

function isPersistedAppState(value: unknown): value is PersistedAppState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const state = value as PersistedAppState;
  return (
    state.version === APP_STATE_VERSION &&
    isPersistedTimerState(state.mainTimer) &&
    isPersistedTimerState(state.subTimer) &&
    typeof state.isSubTimerActive === "boolean" &&
    Array.isArray(state.todos) &&
    state.todos.length > 0 &&
    state.todos.every(isTodoItemData)
  );
}

export function loadAppState(): PersistedAppState {
  if (typeof window === "undefined") {
    return createDefaultAppState();
  }

  try {
    const raw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
    if (!raw) {
      return createDefaultAppState();
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedAppState(parsed)) {
      return createDefaultAppState();
    }

    return parsed;
  } catch {
    return createDefaultAppState();
  }
}

export function saveAppState(state: PersistedAppState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
}
