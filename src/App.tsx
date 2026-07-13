import { useCallback, useEffect, useRef, useState } from "react";
import Timer from "./components/Timer";
import Todo from "./components/Todo";
import { useAdjustWindowHeight } from "./hooks/useAdjustWindowHeight";
import { loadAppState, saveAppState } from "./lib/appState";
import { ensureNotificationPermission } from "./lib/notify";
import type { PersistedAppState } from "./types/appState";
import type { TodoItemData } from "./types/todo";
import "./App.scss";

function App() {
  const slotRef = useAdjustWindowHeight<HTMLDivElement>();
  const [initialState] = useState(() => loadAppState());
  const appStateRef = useRef<PersistedAppState>(initialState);

  useEffect(() => {
    void ensureNotificationPermission();
  }, []);

  const persistTimerState = useCallback(
    (
      timerState: Pick<
        PersistedAppState,
        "mainTimer" | "subTimer" | "isSubTimerActive"
      >,
    ) => {
      appStateRef.current = {
        ...appStateRef.current,
        ...timerState,
      };
      saveAppState(appStateRef.current);
    },
    [],
  );

  const persistTodos = useCallback((todos: TodoItemData[]) => {
    appStateRef.current = {
      ...appStateRef.current,
      todos,
    };
    saveAppState(appStateRef.current);
  }, []);

  return (
    <main className="app-shell">
      <div className="timer-slot" ref={slotRef}>
        <Timer
          initialMainTimer={initialState.mainTimer}
          initialSubTimer={initialState.subTimer}
          initialSubTimerActive={initialState.isSubTimerActive}
          onPersist={persistTimerState}
        />
        <Todo initialItems={initialState.todos} onPersist={persistTodos} />
      </div>
    </main>
  );
}

export default App;
