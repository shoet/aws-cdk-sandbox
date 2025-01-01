import styles from "./index.module.scss";
import { Todo } from "../../types/todo";

type TodoRowProps = {
  todo: Todo;
  handleDone: (id: number) => void;
};

export const TodoRow = (props: TodoRowProps) => {
  const { todo, handleDone } = props;

  return (
    <div className={styles.todoRow}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => handleDone(todo.id)}
      />
      <span>{todo.title}</span>
    </div>
  );
};
