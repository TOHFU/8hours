import Timer from "./components/Timer";
import Todo from "./components/Todo";
import "./App.scss";

function App() {
  return (
    <main className="app-shell">
      <div className="timer-slot">
        <Timer />
        <Todo />
      </div>
    </main>
  );
}

export default App;
