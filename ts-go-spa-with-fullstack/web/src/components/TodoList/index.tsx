import { Todo } from "../../types/todo";
import { TodoRow } from "../TodoRow";
import styles from "./index.module.scss";

type TodoListProps = {
  todoList: Todo[];
  handleDone: (id: number) => void;
};

export const TodoList = (props: TodoListProps) => {
  const { todoList, handleDone } = props;

  return (
    <div className={styles.todoList}>
      {todoList.map((todo) => {
        return <TodoRow key={todo.id} todo={todo} handleDone={handleDone} />;
      })}
    </div>
  );
};
