import { playCelebrationSound } from "../utils/playCelebrationSound";
import { playToggleOffSound } from "../utils/playToggleSound";
import "./TodoItemCheckbox.scss";

type TodoItemCheckboxProps = {
  className?: string;
  checked: boolean;
  onToggleChecked: (checked: boolean) => void;
};

function TodoItemCheckbox({
  className = "todo-item-checkbox",
  checked,
  onToggleChecked,
}: TodoItemCheckboxProps) {
  const handleChange = () => {
    const nextChecked = !checked;
    if (nextChecked) {
      playCelebrationSound();
    } else {
      playToggleOffSound();
    }
    onToggleChecked(nextChecked);
  };

  return (
    <input
      type="checkbox"
      className={className}
      checked={checked}
      onChange={handleChange}
    />
  );
}

export default TodoItemCheckbox;
