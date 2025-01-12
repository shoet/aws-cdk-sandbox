import mysql, {
  ConnectionOptions as MySQLConnectionOptions,
  RowDataPacket,
} from "mysql2/promise";
import { Config } from "../config/index.js";

export interface IDBClient {
  query<T>(query: string): Promise<T>;
}

export class DBConnectionOptions {
  public readonly host: string;
  public readonly port: number;
  public readonly user: string;
  public readonly password: string;
  public readonly database: string;

  constructor(
    host: string,
    port: number,
    user: string,
    password: string,
    database: string
  ) {
    this.host = host;
    this.port = port;
    this.user = user;
    this.password = password;
    this.database = database;
  }

  static fromConfig(config: Config): DBConnectionOptions {
    return new DBConnectionOptions(
      config.db_host,
      config.db_port,
      config.db_user,
      config.db_password,
      config.db_database
    );
  }

  public getMySQLConnectionOptions(): MySQLConnectionOptions {
    return {
      host: this.host,
      port: this.port,
      user: this.user,
      password: this.password,
      database: this.database,
    };
  }
}

export class MySQLClient implements IDBClient {
  private connectionOptions: DBConnectionOptions;
  constructor(connectionOptions: DBConnectionOptions) {
    this.connectionOptions = connectionOptions;
  }

  public async query<T>(query: string): Promise<T> {
    const options = this.connectionOptions.getMySQLConnectionOptions();
    const conn = await mysql.createConnection(options);
    const result = await conn.execute<RowDataPacket[]>(query);
    const [rows, _] = result;
    return rows as T;
  }
}
