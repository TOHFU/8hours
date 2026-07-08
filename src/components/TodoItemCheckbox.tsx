import { playToggleOffSound, playToggleOnSound } from "../utils/playToggleSound";
import "./TodoItemCheckbox.scss";

type TodoItemCheckboxProps = {
  checked: boolean;
  onToggleChecked: (checked: boolean) => void;
};

function TodoItemCheckbox({ checked, onToggleChecked }: TodoItemCheckboxProps) {
  const handleChange = () => {
    const nextChecked = !checked;
    if (nextChecked) {
      playToggleOnSound();
    } else {
      playToggleOffSound();
    }
    onToggleChecked(nextChecked);
  };

  return (
    <input
      type="checkbox"
      className="todo-item-checkbox"
      checked={checked}
      onChange={handleChange}
    />
  );
}

export default TodoItemCheckbox;
