import Timer from "./components/Timer";
import Todo from "./components/Todo";
import { useAdjustWindowHeight } from "./hooks/useAdjustWindowHeight";
import "./App.scss";

function App() {
  const slotRef = useAdjustWindowHeight<HTMLDivElement>();

  return (
    <main className="app-shell">
      <div className="timer-slot" ref={slotRef}>
        <Timer />
        <Todo />
      </div>
    </main>
  );
}

export default App;
