import { useEffect, useState } from "react";
import { getAPIURL, handleFailure, handleSuccess } from "../api";
import { Todo } from "../types/todo";

export const useTodoList = () => {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const getTodoList = async () => {
    const todos: Todo[] = await fetch(getAPIURL("/"), {
      headers: { "Content-Type": "application/json" },
    })
      .then(handleSuccess)
      .catch((error: unknown) => {
        setIsError(true);
        handleFailure(error);
      });
    setTodoList(todos);
    setIsLoading(false);
  };

  useEffect(() => {
    getTodoList();
  }, []);

  return {
    todoList,
    isLoading,
    isError,
    mutate: getTodoList,
  };
};
