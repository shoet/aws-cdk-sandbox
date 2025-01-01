import { getAPIURL, handleFailure, handleSuccess } from ".";
import { Todo } from "../types/todo";

export const createTodo = async (todo: Todo) => {
  await fetch(getAPIURL("/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ todo: todo }),
  })
    .then(handleSuccess)
    .catch((error: unknown) => {
      handleFailure(error);
    });
};
