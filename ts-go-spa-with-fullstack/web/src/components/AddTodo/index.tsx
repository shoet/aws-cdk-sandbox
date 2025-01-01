import styles from "./index.module.scss";

type AddTodoProps = {
  addTodo: (title: string) => void;
};

export const AddTodo = (props: AddTodoProps) => {
  const { addTodo } = props;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input");
    if (input) {
      addTodo(input.value);
      input.value = "";
    }
  };

  return (
    <form className={styles.addTodoForm} onSubmit={handleSubmit}>
      <input className={styles.input} type="text" />
      <button className={styles.submitButton} type="submit">
        Add
      </button>
    </form>
  );
};
