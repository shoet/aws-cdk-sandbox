import * as dotenv from "dotenv";
import { z } from "zod";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export type Config = {
  db_host: string;
  db_port: number;
  db_user: string;
  db_password: string;
  db_database: string;
};

const DBConfigZodType = z.object({
  host: z.string(),
  port: z.number(),
  username: z.string(),
  password: z.string(),
  dbname: z.string(),
});

export async function getConfig(): Promise<Config> {
  let dbConfig: any;

  if (process.env.NODE_ENV == "production") {
    const secretsID = process.env.DB_SECRETS_ID;
    const secretsManager = new SecretsManagerClient();
    const getCommand = new GetSecretValueCommand({
      SecretId: secretsID,
    });
    const result = await secretsManager.send(getCommand);
    if (result.SecretString == undefined) {
      throw new Error("Failed to load secrets");
    }
    dbConfig = JSON.parse(result.SecretString);
  } else {
    console.log("Loading .env file");
    const { error } = dotenv.config();
    if (error) {
      throw new Error("Failed to load .env file");
    }
    dbConfig = process.env;
  }

  const result = DBConfigZodType.safeParse(dbConfig);
  if (!result.success) {
    console.log("Invalid configuration", result.error.format());
    throw new Error("Invalid configuration");
  }
  return {
    db_host: result.data.host,
    db_port: result.data.port,
    db_user: result.data.username,
    db_password: result.data.password,
    db_database: result.data.dbname,
  };
}
