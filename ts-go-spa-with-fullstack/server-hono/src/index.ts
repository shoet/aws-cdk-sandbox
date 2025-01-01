import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import * as ddb from "@aws-sdk/client-dynamodb";
import { TodoRepository } from "./repository/todo_repository.js";

const app = new Hono();
const ddbClient = new ddb.DynamoDBClient();
const todoRepository: TodoRepository = new TodoRepository(ddbClient);

app.use("/*", cors());

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/", async (c) => {
  const todos = await todoRepository.getTodos();
  return c.json(todos);
});

app.post("/", async (c) => {
  const body = await c.req.json<{
    todo: { id: number; title: string; done: boolean };
  }>();
  const { id, title, done } = body.todo;
  const newTodo = await todoRepository.createTodo({
    id,
    title,
    done,
    createdAt: Math.floor(Date.now() / 1000),
  });
  return c.json(newTodo);
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
