import styles from "./App.module.scss";
import { Card } from "./components/Card";
import { Header } from "./components/Header";
import { TodoList } from "./components/TodoList";
import { Todo } from "./types/todo";
import { AddTodo } from "./components/AddTodo";
import { useTodoList } from "./hooks/useTodoList";
import { createTodo } from "./api/create-todo";

function App() {
  const { todoList, mutate } = useTodoList();

  const handleAddTodo = async (title: string) => {
    const newTodo: Todo = {
      id: todoList.length + 1,
      title: title,
      done: false,
      createdAt: Date.now(),
    };
    await createTodo(newTodo);
    mutate();
  };

  const doneTodo = (_: number) => {
    // const newTodoList = todoList.map((todo) =>
    //   todo.id === id ? { ...todo, done: !todo.done } : todo
    // );
    // setTodoList(newTodoList);
  };

  return (
    <div className={styles.body}>
      <header className={styles.header}>
        <Header />
      </header>
      <div className={styles.content}>
        <AddTodo addTodo={handleAddTodo} />
        <Card>
          <TodoList todoList={todoList} handleDone={doneTodo} />
        </Card>
      </div>
    </div>
  );
}

export default App;
