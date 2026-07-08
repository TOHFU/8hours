import { Plus } from "lucide-react";
import "./TodoAddButton.scss";

type TodoAddButtonProps = {
  onClick: () => void;
};

function TodoAddButton({ onClick }: TodoAddButtonProps) {
  return (
    <button
      type="button"
      className="todo-add-buton"
      aria-label="Add todo"
      onClick={onClick}
    >
      <Plus size={16} color="#EEEEEE" />
    </button>
  );
}

export default TodoAddButton;
