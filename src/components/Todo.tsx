import "./Todo.scss";
import { Ellipsis, Plus } from 'lucide-react';

function Todo() {
  return (
    <div className="todo">
      <ul className="todo-list">
        <li className="todo-item is-black">
          <input type="text" value="テストテスト" className="todo-item-input" readOnly/>
          <div className="todo-item-menu is-open">
            <Ellipsis className="todo-item-menu-icon" size={12} color="#DDDDDD"/>
            <ul className="todo-item-menu-list">
              <li className="todo-item-menu-list-item circle circle-black"></li>
              <li className="todo-item-menu-list-item circle circle-red"></li>
              <li className="todo-item-menu-list-item circle circle-blue"></li>
              <li className="todo-item-menu-list-item circle circle-yellow"></li>
              <li className="todo-item-menu-list-item circle circle-pink"></li>
              <li className="todo-item-menu-list-item delete">DELETE</li>
            </ul>
          </div>
          <input type="checkbox" className="todo-item-checkbox"/>
        </li>
        <li className="todo-item is-red">
          <input type="text" value="テストテスト" className="todo-item-input" readOnly/>
          <div className="todo-item-menu">
            <Ellipsis className="todo-item-menu-icon" size={12} color="#DDDDDD"/>
            <ul className="todo-item-menu-list">
              <li className="todo-item-menu-list-item circle circle-black"></li>
              <li className="todo-item-menu-list-item circle circle-red"></li>
              <li className="todo-item-menu-list-item circle circle-blue"></li>
              <li className="todo-item-menu-list-item circle circle-yellow"></li>
              <li className="todo-item-menu-list-item circle circle-pink"></li>
              <li className="todo-item-menu-list-item delete">DELETE</li>
            </ul>
          </div>
          <input type="checkbox" className="todo-item-checkbox" />
        </li>
        <li className="todo-item is-blue">
          <input type="text" value="テストテスト" className="todo-item-input" readOnly/>
          <div className="todo-item-menu">
            <Ellipsis className="todo-item-menu-icon" size={12} color="#DDDDDD"/>
            <ul className="todo-item-menu-list">
              <li className="todo-item-menu-list-item circle circle-black"></li>
              <li className="todo-item-menu-list-item circle circle-red"></li>
              <li className="todo-item-menu-list-item circle circle-blue"></li>
              <li className="todo-item-menu-list-item circle circle-yellow"></li>
              <li className="todo-item-menu-list-item circle circle-pink"></li>
              <li className="todo-item-menu-list-item delete">DELETE</li>
            </ul>
          </div>
          <input type="checkbox" className="todo-item-checkbox" />
        </li>
      </ul>
      <div className="todo-add-buton"><Plus size={16} color="#EEEEEE" /></div>
    </div>
  )
}

export default Todo;