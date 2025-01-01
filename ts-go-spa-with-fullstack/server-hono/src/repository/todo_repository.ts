import * as ddb from "@aws-sdk/client-dynamodb";
import type { Todo } from "../type/todo.js";

export interface ITodoRepository {}

export class TodoRepository implements ITodoRepository {
  private readonly TABLE_NAME = "TodoTable";
  private ddbClient: ddb.DynamoDBClient;

  constructor(ddbClient: ddb.DynamoDBClient) {
    this.ddbClient = ddbClient;
  }

  public async getTodos(): Promise<Todo[]> {
    const scanCommand = new ddb.ScanCommand({
      Limit: 100,
      TableName: this.TABLE_NAME,
    });
    const res = await this.ddbClient.send(scanCommand);
    if (res.Count === 0) {
      return [];
    }
    try {
      const todos: Todo[] = res.Items?.map((item) => this.toItem(item)) ?? [];
      return todos;
    } catch (e) {
      console.error("Convert todo error", e);
      throw e;
    }
  }

  public async createTodo(todo: Todo): Promise<Todo> {
    const putCommand = new ddb.PutItemCommand({
      TableName: this.TABLE_NAME,
      Item: {
        id: { N: todo.id.toString() },
        title: { S: todo.title },
        done: { BOOL: todo.done },
        createdAt: { N: todo.createdAt.toString() },
      },
      ReturnValues: "ALL_OLD",
    });
    await this.ddbClient.send(putCommand);
    return todo;
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
