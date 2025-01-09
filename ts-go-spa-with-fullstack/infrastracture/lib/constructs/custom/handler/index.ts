import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

import mysql, { ConnectionOptions } from "mysql2/promise";

type Payload = {
  config: {
    secretID: string;
  };
};

type DBConfig = {
  password: string;
  dbname: string;
  port: number;
  host: string;
  username: string;
};

async function getSecrets(secretArn: string): Promise<DBConfig> {
  const client = new SecretsManagerClient();
  const getCommand = new GetSecretValueCommand({
    SecretId: secretArn,
  });

  const result = await client.send(getCommand);
  const secretString = result.SecretString;
  if (!secretString) {
    throw new Error("Failed to get secret");
  }

  try {
    const dbConfig: DBConfig = JSON.parse(secretString);
    return dbConfig;
  } catch (e) {
    throw new Error("Failed to parse secret");
  }
}

async function connectionDB(dbConfig: DBConfig): Promise<mysql.Connection> {
  const connection: ConnectionOptions = {
    host: dbConfig.host,
    pool: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.dbname,
  };

  const conn = await mysql.createConnection(connection);
  try {
    await conn.ping();
  } catch (e) {
    console.error("Failed to ping DB", e);
    throw e;
  }
  return conn;
}

export async function handler(payload: Payload): Promise<any> {
  const { secretID } = payload.config;
  let dbConfig: DBConfig;
  try {
    dbConfig = await getSecrets(secretID);
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to get secret",
      }),
    };
  }

  let conn: mysql.Connection;
  try {
    conn = await connectionDB(dbConfig);
  } catch (e) {
    console.error("Failed to connect to DB", e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to connect to DB",
      }),
    };
  }

  console.log("Connected to DB");

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello, world!",
    }),
  };
}
