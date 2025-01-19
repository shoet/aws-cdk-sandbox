import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import * as ddb from "@aws-sdk/client-dynamodb";
import {
  ITodoRepository,
  TodoRepository,
} from "./repository/todo_repository.js";
import { Config, getConfig } from "./config/index.js";
import { DBConnectionOptions, MySQLClient } from "./repository/db_client.js";

let config: Config;
try {
  config = await getConfig();
} catch (e) {
  console.error("Failed to load configuration", e);
  process.exit(1);
}
const app = new Hono();
const ddbClient = new ddb.DynamoDBClient();
const dbConfig = DBConnectionOptions.fromConfig(config);
const dbClient = new MySQLClient(dbConfig);
await dbClient.ping();
const todoRepository: ITodoRepository = new TodoRepository(ddbClient, dbClient);

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
  await todoRepository.createTodo({
    id,
    title,
    done,
    createdAt: Math.floor(Date.now() / 1000),
  });
  return c.json({ status: "ok" });
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
