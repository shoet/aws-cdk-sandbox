import * as ddb from "@aws-sdk/client-dynamodb";
import type { Todo } from "../type/todo.js";
import { IDBClient } from "./db_client.js";

export interface ITodoRepository {
  getTodos(): Promise<Todo[]>;
  createTodo: (todo: Todo) => Promise<void>;
}

export class TodoRepository implements ITodoRepository {
  private readonly TABLE_NAME = "TodoTable";
  private ddbClient: ddb.DynamoDBClient;
  private dbClient: IDBClient;

  constructor(ddbClient: ddb.DynamoDBClient, dbClient: IDBClient) {
    this.ddbClient = ddbClient;
    this.dbClient = dbClient;
  }

  // public async getTodos(): Promise<Todo[]> {
  //   const scanCommand = new ddb.ScanCommand({
  //     Limit: 100,
  //     TableName: this.TABLE_NAME,
  //   });
  //   const res = await this.ddbClient.send(scanCommand);
  //   if (res.Count === 0) {
  //     return [];
  //   }
  //   try {
  //     const todos: Todo[] = res.Items?.map((item) => this.toItem(item)) ?? [];
  //     return todos;
  //   } catch (e) {
  //     console.error("Convert todo error", e);
  //     throw e;
  //   }
  // }

  public async getTodos(): Promise<Todo[]> {
    const query = "SELECT * FROM todo";
    const todos = await this.dbClient.query<Todo[]>(query);
    return todos;
  }

  // public async createTodo(todo: Todo): Promise<Todo> {
  //   const putCommand = new ddb.PutItemCommand({
  //     TableName: this.TABLE_NAME,
  //     Item: {
  //       id: { N: todo.id.toString() },
  //       title: { S: todo.title },
  //       done: { BOOL: todo.done },
  //       createdAt: { N: todo.createdAt.toString() },
  //     },
  //     ReturnValues: "ALL_OLD",
  //   });
  //   await this.ddbClient.send(putCommand);
  //   return todo;
  // }

  public async createTodo(todo: Todo): Promise<void> {
    const query = `INSERT INTO todo (title) VALUES ('${todo.title}');`;
    await this.dbClient.query<Todo[]>(query);
  }

  private toItem(record: Record<string, any>): Todo {
    return {
      id: record.id.N,
      title: record.title.S,
      done: record.done.BOOL,
      createdAt: record.createdAt.N,
    };
  }
}
